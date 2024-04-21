const cmcConfig = {
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
  }
}

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