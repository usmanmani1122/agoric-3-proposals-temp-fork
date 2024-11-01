import { execSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { ProposalInfo, imageNameForProposal } from './proposals.js';

/**
 * Used to propagate a SLOGFILE environment variable into Docker containers.
 * Any file identified by such a variable will be created if it does not already
 * exist.
 *
 * @param {typeof process.env} env environment variables
 * @returns {string[]} docker run options
 */
const propagateSlogfile = env => {
  const { SLOGFILE } = env;
  if (!SLOGFILE) return [];

  execSync('touch "$SLOGFILE"');
  return ['-e', 'SLOGFILE', '-v', `"$SLOGFILE:${realpathSync(SLOGFILE)}"`];
};

export const runTestImage = (proposal: ProposalInfo) => {
  console.log(`Running test image for proposal ${proposal.proposalName}`);
  const { name } = imageNameForProposal(proposal, 'test');
  const slogOpts = propagateSlogfile(process.env);
  // 'rm' to remove the container when it exits
  const cmd = `docker run ${slogOpts.join(' ')} --rm ${name}`;
  execSync(cmd, { stdio: 'inherit' });
};

export const debugTestImage = (proposal: ProposalInfo) => {
  const { name } = imageNameForProposal(proposal, 'test');
  console.log(
    `
  Starting chain of test image for proposal ${proposal.proposalName}
  
  To get an interactive shell in the container, use an IDE feature like "Attach Shell" or this command:'
  
    docker exec -ti $(docker ps -q -f ancestor=${name}) bash
  
  And within that shell:
    cd /usr/src/proposals/${proposal.path} && ./test.sh
  
  To edit files you can use terminal tools like vim, or mount the container in your IDE.
  In VS Code the command is:
    Dev Containers: Attach to Running Container...
  `,
  );

  const slogOpts = propagateSlogfile(process.env);
  // start the chain with ports mapped
  const cmd = `docker run ${slogOpts.join(' ')} --publish 26657:26657 --publish 1317:1317 --publish 9090:9090 --interactive --tty --entrypoint /usr/src/upgrade-test-scripts/start_agd.sh ${name}`;
  execSync(cmd, { stdio: 'inherit' });
};
