// This is generated by writeCoreEval; please edit!
/* eslint-disable */

const manifestBundleRef = {
  bundleID:
    'b1-e04a36a106cb0df35c7fa7e178c2d59f58a0b29ba112fe4dbf4b31e2c55f13ccd77650fc2510bf1ddf27a64482f18a2d1a5f0fe16ab0ecc394d36f71d95e1552',
};
const getManifestCall = harden([
  'getManifestForPsm',
  {
    anchorOptions: {
      decimalPlaces: 6,
      denom: 'ibc/000C0AAAEECAFE000',
      keyword: 'USD_LEMONS',
      proposedName: 'USD_LEMONS',
    },
    installKeys: {
      mintHolder: {
        bundleID:
          'b1-dd9936f5d30f621bff3aaf20a2d454f509ddbe0e011de385d075956589e9186336a96f4f11ee2d5cb1b12b8acfd7d4aba6beea22ef639b0c4ad6723d37467df4',
      },
      psm: {
        bundleID:
          'b1-b584bbc81dc2a3f8758ca9fdc61c4c72419ebb5ff5f3e9371d0d26c71d1cc41cc035b860c887f7cbbfc77aff4d7cd2b52060dd06f1c8d738d2ead53e4eff0edd',
      },
    },
  },
]);
const customManifest = {
  makeAnchorAsset: {
    consume: {
      agoricNamesAdmin: true,
      anchorBalancePayments: true,
      anchorKits: true,
      bankManager: 'bank',
      startUpgradable: true,
    },
    installation: {
      consume: {
        mintHolder: 'zoe',
      },
    },
    produce: {
      anchorBalancePayments: true,
      anchorKits: true,
      testFirstAnchorKit: true,
    },
    vatParameters: {
      chainStorageEntries: true,
    },
  },
  startPSM: {
    brand: {
      consume: {
        IST: 'zoe',
      },
    },
    consume: {
      agoricNamesAdmin: true,
      anchorBalancePayments: true,
      board: true,
      chainStorage: true,
      chainTimerService: 'timer',
      diagnostics: true,
      econCharterKit: 'econCommitteeCharter',
      economicCommitteeCreatorFacet: 'economicCommittee',
      feeMintAccess: 'zoe',
      provisionPoolStartResult: true,
      psmKit: true,
      zoe: 'zoe',
    },
    installation: {
      consume: {
        contractGovernor: 'zoe',
        psm: 'zoe',
      },
    },
    instance: {
      consume: {
        economicCommittee: 'economicCommittee',
      },
    },
    produce: {
      psmKit: 'true',
    },
    vatParameters: {
      chainStorageEntries: true,
    },
  },
};

// Make a behavior function and "export" it by way of script completion value.
// It is constructed by an anonymous invocation to ensure the absence of a global binding
// for makeCoreProposalBehavior, which may not be necessary but preserves behavior pre-dating
// https://github.com/Agoric/agoric-sdk/pull/8712 .
const behavior = (({
  manifestBundleRef,
  getManifestCall: [manifestGetterName, ...manifestGetterArgs],
  customManifest,
  E,
  log = console.info,
  customRestoreRef,
}) => {
  const { entries, fromEntries } = Object;

  /**
   * Given an object whose properties may be promise-valued, return a promise
   * for an analogous object in which each such value has been replaced with its
   * fulfillment.
   * This is a non-recursive form of endo `deeplyFulfilled`.
   *
   * @template T
   * @param {{[K in keyof T]: (T[K] | Promise<T[K]>)}} obj
   * @returns {Promise<T>}
   */
  const shallowlyFulfilled = async obj => {
    if (!obj) {
      return obj;
    }
    const awaitedEntries = await Promise.all(
      entries(obj).map(async ([key, valueP]) => {
        const value = await valueP;
        return [key, value];
      }),
    );
    return fromEntries(awaitedEntries);
  };

  const makeRestoreRef = (vatAdminSvc, zoe) => {
    /** @type {(ref: import\('./externalTypes.js').ManifestBundleRef) => Promise<Installation<unknown>>} */
    const defaultRestoreRef = async bundleRef => {
      // extract-proposal.js creates these records, and bundleName is
      // the optional name under which the bundle was installed into
      // config.bundles
      const bundleIdP =
        'bundleName' in bundleRef
          ? E(vatAdminSvc).getBundleIDByName(bundleRef.bundleName)
          : bundleRef.bundleID;
      const bundleID = await bundleIdP;
      const label = bundleID.slice(0, 8);
      return E(zoe).installBundleID(bundleID, label);
    };
    return defaultRestoreRef;
  };

  /** @param {ChainBootstrapSpace & BootstrapPowers & { evaluateBundleCap: any }} powers */
  const coreProposalBehavior = async powers => {
    // NOTE: `powers` is expected to match or be a superset of the above `permits` export,
    // which should therefore be kept in sync with this deconstruction code.
    // HOWEVER, do note that this function is invoked with at least the *union* of powers
    // required by individual moduleBehaviors declared by the manifest getter, which is
    // necessary so it can use `runModuleBehaviors` to provide the appropriate subset to
    // each one (see ./writeCoreEvalParts.js).
    // Handle `powers` with the requisite care.
    const {
      consume: { vatAdminSvc, zoe, agoricNamesAdmin },
      evaluateBundleCap,
      installation: { produce: produceInstallations },
      modules: {
        utils: { runModuleBehaviors },
      },
    } = powers;

    // Get the on-chain installation containing the manifest and behaviors.
    log('evaluateBundleCap', {
      manifestBundleRef,
      manifestGetterName,
      vatAdminSvc,
    });
    let bcapP;
    if ('bundleName' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getNamedBundleCap(manifestBundleRef.bundleName);
    } else if ('bundleID' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getBundleCap(manifestBundleRef.bundleID);
    } else {
      const keys = Reflect.ownKeys(manifestBundleRef).map(key =>
        typeof key === 'string' ? JSON.stringify(key) : String(key),
      );
      const keysStr = `[${keys.join(', ')}]`;
      throw Error(
        `bundleRef must have own bundleName or bundleID, missing in ${keysStr}`,
      );
    }
    const bundleCap = await bcapP;

    const proposalNS = await evaluateBundleCap(bundleCap);

    // Get the manifest and its metadata.
    log('execute', {
      manifestGetterName,
      bundleExports: Object.keys(proposalNS),
    });
    const restoreRef = customRestoreRef || makeRestoreRef(vatAdminSvc, zoe);
    const {
      manifest,
      options: rawOptions,
      installations: rawInstallations,
    } = await proposalNS[manifestGetterName](
      harden({ restoreRef }),
      ...manifestGetterArgs,
    );

    // Await promises in the returned options and installations records.
    const [options, installations] = await Promise.all(
      [rawOptions, rawInstallations].map(shallowlyFulfilled),
    );

    // Publish the installations for our dependencies.
    const installationEntries = entries(installations || {});
    if (installationEntries.length > 0) {
      const installAdmin = E(agoricNamesAdmin).lookupAdmin('installation');
      await Promise.all(
        installationEntries.map(([key, value]) => {
          produceInstallations[key].reset();
          produceInstallations[key].resolve(value);
          return E(installAdmin).update(key, value);
        }),
      );
    }

    // Evaluate the manifest.
    return runModuleBehaviors({
      // Remember that `powers` may be arbitrarily broad.
      allPowers: powers,
      behaviors: proposalNS,
      manifest: customManifest || manifest,
      makeConfig: (name, _permit) => {
        log('coreProposal:', name);
        return { options };
      },
    });
  };

  return coreProposalBehavior;
})({ manifestBundleRef, getManifestCall, customManifest, E });
behavior;
