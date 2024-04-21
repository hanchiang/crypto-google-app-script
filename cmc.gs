const cmcMemeConfig = {
  'PEPE': {
    id: 24478
  },
  'MUMU': {
    id: 24581,
    holderIgnoreList: [
      '0xabd50310f2a409257576ff4337ec0ab664ae8cdc'  // uniswap v2
    ]
  },
  'BOBO': {
    id: 25269
  },
  'SNIBBU': {
    id: '',
  },
  'WOJAK': {
    id: 24502
  },
  'ANDY': {
    id: 30376
  },
  'BRETT': {
    id: 29743
  },
  'WOLF': {
    id: 28746
  },
  'BODEN': {
    id: 29687
  },
  'WIF': {
    id: 28752
  }, 
  'REDO': {
    id: 30116
  },
  'CONAN': {
    id: ''
  },
  'PAC': {
    id: 30662
  },
};

const cmcGamblefiConfig = {
   'TGC': {
    id: 28919
  },
};

const cmcInjectiveConfig = {
  'SUSHI': {
    id: 29623
  },
  'DOJO': {
    id: 29102
  },
  'DAOJO': {
    id: 30568
  },
  'BABYDOJO': {
    id: 30567
  },
};

const cmcRwaConfig = {
  'LNDX': {
    id: 29386
  },
  'SMT': {
    id: 11821
  },
  'RIO': {
    id: 4166
  },
  'BST': {
    id: 3035
  },
  'GFI': {
    id: 13967
  },
  'MPL': {
    id: 9417
  },
  'NAOS': {
    id: 9504
  },
  'WCFG': {
    id: 10898
  },
};

const cmcAiConfig = {
  'NMT': {
    id: 29447
  },
  'KNDX': {
    id: 21736
  },
  'NOIA': {
    id: 4191
  },
  'GLQ': {
    id: 9029
  },
  'ENQAI': {
    id: 24489
  },
  'LUSH': {
    id: 29517
  },
  'CDX': {
    id: 29177
  },
  'WBAI': {
    id: 29510
  },
  'SORA': {
    id: 29434
  },
  'WTAO': {
    id: 23528
  }
};

const cmcConfig = {
  ...cmcMemeConfig,
  ...cmcGamblefiConfig,
  ...cmcInjectiveConfig,
  ...cmcRwaConfig,
  ...cmcAiConfig
};

const globalHolderIgnoreList = ['0x000000000000000000000000000000000000dead'];

initCmc(cmcConfig);

const getHolderIgnoreList = (ticker) => {
  const ignoreList = new Set();
  for (const ignore of [...globalHolderIgnoreList, ...cmcConfig[ticker].holderIgnoreList || []]) {
    ignoreList.add(ignore);
  }
  return ignoreList;
}

const cmcCoinDetail = (id) => {
  const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id=${id}`;
  const response = UrlFetchApp.fetch(url);
  if (response.getResponseCode() >= 400) {
    const msg = `error fetching from ${url}, response: ${response}`;
    console.log(msg)
    throw new Error(msg);
  }
  return JSON.parse(UrlFetchApp.fetch(url).getContentText());
}