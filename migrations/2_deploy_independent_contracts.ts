import { MultiSigConfigByNetwork, ContractInstance } from '../util/types';
import { Artifacts } from '../util/artifacts';
const {
  MultiSigWalletWithTimeLock,
  Proxy,
  EtherToken,
  ZRXToken,
  TokenRegistry,
} = new Artifacts(artifacts);

let multiSigConfigByNetwork: MultiSigConfigByNetwork;
try {
  /* tslint:disable */
  const multiSigConfig = require('./config/multisig');
  multiSigConfigByNetwork = multiSigConfig.multiSig;
  /* tslint:enable */
} catch (e) {
  multiSigConfigByNetwork = {};
}

module.exports = (deployer: any, network: string, accounts: string[]) => {
  const defaultConfig = {
    owners: [accounts[0], accounts[1]],
    confirmationsRequired: 2,
    secondsRequired: 0,
  };
  const config = multiSigConfigByNetwork[network] || defaultConfig;
  if (network !== 'live') {
      deployer.deploy(MultiSigWalletWithTimeLock, config.owners, config.confirmationsRequired, config.secondsRequired)
      .then(() => {
          return deployer.deploy(Proxy);
      }).then(() => {
          return deployer.deploy(TokenRegistry);
      }).then(() => {
          return deployer.deploy(EtherToken);
      }).then(() => {
          return deployer.deploy(ZRXToken);
      });
  } else {
    deployer.deploy([
      [MultiSigWalletWithTimeLock, config.owners, config.confirmationsRequired, config.secondsRequired],
      Proxy,
      TokenRegistry,
    ]);
  }
};
