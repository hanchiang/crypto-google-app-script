const cryptoConfig = {
    'PEPE': {
      'tokenAddress': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      'pairAddress': '0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f',
      'chain': 'ethereum'
    },
    'MUMU': {
      'tokenAddress': '0x2F573070E6090b3264Fe707e2C9F201716F123c7',
      'pairAddress': '0xf9F7F108B3e2323343acf9bD9D34906aA478DE6d',
      'chain': 'ethereum'
    },
    'BOBO': {
      'tokenAddress': '0xB90B2A35C65dBC466b04240097Ca756ad2005295',
      'pairAddress': '0xe945683B3462D2603a18BDfBB19261C6a4f03aD1',
      'chain': 'ethereum'
    },
    'SNIBBU': {
      'tokenAddress': '0xAeE9bA9CE49fe810417A36408e34D9962b653E78',
      'pairAddress': '0x1c726D5F71eaD5Acf30A60912f839A752b3C6d6D',
      'chain': 'ethereum'
    },
    'WOJAK': {
      'tokenAddress': '0x5026F006B85729a8b14553FAE6af249aD16c9aaB',
      'pairAddress': '0x0F23d49bC92Ec52FF591D091b3e16c937034496E',
      'chain': 'ethereum'
    },
    'ANDY': {
      'tokenAddress': '0xd43D8aDAC6A4C7d9Aeece7c3151FcA8f23752cf8',
      'pairAddress': '0x713ea4a158Dc5BCb451beEB13c000698A12F9720',
      'chain': 'blast',
    },
    'BRETT': {
      'tokenAddress': '0x532f27101965dd16442E59d40670FaF5eBB142E4',
      'pairAddress': '0xBA3F945812a83471d709BCe9C3CA699A19FB46f7',
      'chain': 'base'
    },
    'WOLF': {
      'tokenAddress': '0x4F94b8AEF08c92fEfe416af073F1Df1E284438EC',
      'pairAddress': '0x08DB8eAfeea89476BFC51b07613F430748ff350a',
      'chain': 'avalanche'
    },
    'BODEN': {
      'tokenAddress': '3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o',
      'pairAddress': '6UYbX1x8YUcFj8YstPYiZByG7uQzAq2s46ZWphUMkjg5',
      'chain': 'solana'
    },
    'WIF': {
      'tokenAddress': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      'pairAddress': 'EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2eLKkirfPm5eyMx',
      'chain': 'solana'
    },
    'REDO': {
      'tokenAddress': 'EQBZ_cafPyDr5KUTs0aNxh0ZTDhkpEZONmLJA2SNGlLm4Cko',
      'pairAddress': 'EQBGXZ9ddZeWypx8EkJieHJX75ct0bpkmu0Y4YoYr3NM0Z9e',
      'chain': 'ton'
    },
    'CONAN': {
      'tokenAddress': '0x85D19fb57CA7DA715695FCf347CA2169144523a7',
      'pairAddress': '0x10bfF0723fA78A7c31260A9CBE7Aa6ff470905d1',
      'chain': 'ethereum',
    }
  }
  
  function initCmc(cmcConfig) {
    // add cmc info
    for (const [ticker, config] of Object.entries(cryptoConfig)) {
      if (cmcConfig[ticker] == null) {
        continue;
      }
      config.cmcId = cmcConfig[ticker].id;
      config.holderIgnoreList = cmcConfig[ticker].holderIgnoreList || [];
    }
  }
  