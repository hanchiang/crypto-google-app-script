/**
 * How to use:
 * Update header row in the sheets
 * Define dexscreener data in crypto-config.gs
 * Define cmc data in cmc.gs
 * Update worksheet-config.gs according to the columns to be displayed
 */

// TODO: ability to set price source. Current priority of price source: cmc, dex screener
function updateCryptoData() {
  const start = new Date();
  if (!shouldRun()) {
    return;
  }

  process();
  const end = new Date();
  const timeElapsed = (end.getTime() - start.getTime()) / 1000;
  console.log(`Took ${timeElapsed} seconds to process`);
}

function shouldRun() {
  const date = new Date();
  const hour = date.getHours();
  return (hour == 8 || hour == 20);
}

function process() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  for (const [ticker, config] of Object.entries(cryptoConfig)) {
    console.log(`Processing sheet ${ticker}`);

    let sheet = spreadsheet.getSheetByName(ticker);
    if (sheet == null) {
      // require sheet to be created explicitly
      console.log(`Sheet for ${ticker} does not exist, creating it`);
      sheet = spreadsheet.insertSheet(ticker)
      
    }
    const numExistingRows = sheet.getDataRange().getValues().length;
    const nextRowNum = numExistingRows + 1;

    writeHeaderRow(sheet)

    const isNonDataColumnsFilled = () => {
      const ticker = getRangeBySheetColNameRowNum(sheet, 'Ticker', 2)
      const quoteTicker = getRangeBySheetColNameRowNum(sheet, 'Quote ticker', 2)
      const chain = getRangeBySheetColNameRowNum(sheet, 'Chain', 2)
      const link = getRangeBySheetColNameRowNum(sheet, 'Link', 2)
      return !ticker.isBlank() && !quoteTicker.isBlank() && !chain.isBlank() && !link.isBlank(); 
    }

    const dexscreenerData = getDexScreenerPairInfo(config.chain, config.pairAddress)
    const { priceNative, priceUsd: dexScreenerPriceUsd, volume, liquidity, txns, quoteToken, chainId, url } = dexscreenerData.pairs[0];
    

    // dex screener data columns
    getRangeBySheetColNameRowNum(sheet, 'Date', nextRowNum).setValue(Utilities.formatDate(new Date(), "GMT+8", 'dd/MM/yyyy HH:mm:ss'));
    setValueIfGreaterThanZero(sheet, 'Price native', nextRowNum, priceNative);
    setValueIfGreaterThanZero(sheet, 'Price USD', nextRowNum, dexScreenerPriceUsd);
    setValueIfGreaterThanZero(sheet, 'Volume 24h', nextRowNum, volume.h24);
    setValueIfGreaterThanZero(sheet, 'Num transaction buy 24h', nextRowNum, txns.h24.buys);
    setValueIfGreaterThanZero(sheet, 'Num transaction sell 24h', nextRowNum, txns.h24.sells);
    setValueIfGreaterThanZero(sheet, 'Liquidity base', nextRowNum, liquidity.base);
    setValueIfGreaterThanZero(sheet, 'Liquidity quote', nextRowNum, liquidity.quote);
    setValueIfGreaterThanZero(sheet, 'Liquidity USD', nextRowNum, liquidity.usd);
    

    // dex screener non data column
    if (!isNonDataColumnsFilled()) {
      console.log('Writing non data columns');
      getRangeBySheetColNameRowNum(sheet, 'Ticker', 2).setValue(ticker);
      getRangeBySheetColNameRowNum(sheet, 'Quote ticker', 2).setValue(quoteToken.symbol);
      getRangeBySheetColNameRowNum(sheet, 'Chain', 2).setValue(chainId);
      getRangeBySheetColNameRowNum(sheet, 'Link', 2).setValue(url);
    }

    updateCmcData(sheet, config, ticker, nextRowNum);

    // set style for newly added row
    sheet.getRange(`${nextRowNum}:${nextRowNum}`).setTextStyle(SpreadsheetApp.newTextStyle().setFontSize(12).setFontFamily('Roboto').build())

    const sleepMs = getRandomSleepMs();
    console.log(`Sleeping for ${sleepMs} ms`);
    Utilities.sleep(sleepMs);
  }
}

const updateCmcData = (sheet, config, ticker, nextRowNum) => {
  // cmc data columns
  if (config.cmcId == null || config.cmcId === '') {
    console.log(`CMC id is not defined for ${ticker}`);
    return;
  }
  const cmcData = getCmcCoinDetail(config.cmcId).data;
  const { watchCount, watchListRanking, isInfiniteMaxSupply, selfReportedCirculatingSupply, volumeChangePercentage24h,
    statistics, holders
  } = cmcData;
  setValueIfAbsGreaterThanZero(sheet, 'Volume change 24h', nextRowNum, volumeChangePercentage24h).setFontColor(getFontColor(volumeChangePercentage24h));
  setValueIfGreaterThanZero(sheet, 'Watch count', nextRowNum, watchCount);
  setValueIfGreaterThanZero(sheet, 'Watchlist ranking', nextRowNum, watchListRanking);
  setValueIfGreaterThanZero(sheet, 'Is infinite max supply', nextRowNum, isInfiniteMaxSupply ? 'true' : 'false');
  setValueIfGreaterThanZero(sheet, 'Self reported circulating supply', nextRowNum, selfReportedCirculatingSupply);

  if (statistics != null && Object.keys(statistics).length > 0) {
    const {
        price, volumeRank, volumeMcRank, circulatingSupply, totalSupply, maxSupply,  marketCap, fullyDilutedMarketCap,
        rank, priceChangePercentage24h
    } = statistics;
    setValueIfGreaterThanZero(sheet, 'Price USD', nextRowNum, price);
    setValueIfAbsGreaterThanZero(sheet, 'Price change 24h', nextRowNum, priceChangePercentage24h).setFontColor(getFontColor(priceChangePercentage24h));
    setValueIfGreaterThanZero(sheet, 'Volume rank', nextRowNum, volumeRank);
    setValueIfGreaterThanZero(sheet, 'Volume mc rank', nextRowNum, volumeMcRank);
    
    setValueIfGreaterThanZero(sheet, 'Circulating supply', nextRowNum, circulatingSupply);
    setValueIfGreaterThanZero(sheet, 'Total supply', nextRowNum, totalSupply);
    setValueIfGreaterThanZero(sheet, 'Max supply', nextRowNum, maxSupply);
    setValueIfGreaterThanZero(sheet, 'Market cap', nextRowNum, marketCap);
    setValueIfGreaterThanZero(sheet, 'Fully diluted market cap', nextRowNum, fullyDilutedMarketCap);
    setValueIfGreaterThanZero(sheet, 'Rank', nextRowNum, rank);
  }

  if (holders != null && Object.keys(holders).length > 0) {
    const { holderCount, holderList } = holders;
    console.log(`Num of items in holderList ${holderList.length}`);

    let processedCount = 0;
    const holderCountThreshold = [10, 20, 50, 100];
    const thresholdCountToRatio = {}
    let ratioSum = 0;
    let currThresholdIndex = 0;
    const holderIgnoreList = getHolderIgnoreList(ticker);
    
    for (let i = 0; i < Math.min(holderList.length, holderCountThreshold[holderCountThreshold.length - 1]); i++) {
      if (holderIgnoreList.has(holderList[i].address.toLowerCase())) {
        console.log(`${holderList[i].address} is in holder ignore list`);
        continue;
      }
      ratioSum += holderList[i].share;
      processedCount++;
      const thresholdCount = holderCountThreshold[currThresholdIndex];
      if (processedCount >= thresholdCount) {
        thresholdCountToRatio[thresholdCount] = ratioSum;
        currThresholdIndex++;
      }
    }
    if (thresholdCountToRatio[holderCountThreshold[currThresholdIndex]] == null) {
      thresholdCountToRatio[holderCountThreshold[currThresholdIndex]]= ratioSum;
    }
    
    console.log(`Processed ${processedCount} items for ${ticker} holder list`)
    setValueIfGreaterThanZero(sheet, 'Holder count', nextRowNum, holderCount);
    setValueIfGreaterThanZero(sheet, 'Top 10 holder ratio', nextRowNum, thresholdCountToRatio[10]);
    setValueIfGreaterThanZero(sheet, 'Top 20 holder ratio', nextRowNum, thresholdCountToRatio[20]);
    setValueIfGreaterThanZero(sheet, 'Top 50 holder ratio', nextRowNum, thresholdCountToRatio[50]);
    setValueIfGreaterThanZero(sheet, 'Top 100 holder ratio', nextRowNum, thresholdCountToRatio[100]);
  }

}

const setValueIfAbsGreaterThanZero = (sheet, colName, rowNum, value) => {
  if (Math.abs(value) > 0) {
    return getRangeBySheetColNameRowNum(sheet, colName, rowNum).setValue(value);
  }
}

const setValueIfGreaterThanZero = (sheet, colName, rowNum, value) => {
  if (value > 0) {
    return getRangeBySheetColNameRowNum(sheet, colName, rowNum).setValue(value);
  }
}

const getFontColor = (value) => {
  if (value > 0) {
    return 'green';
  }
  if (value < 0) {
    return 'red';
  }
  return 'black';
}

const writeHeaderRow = (sheet) => {
  let isWritten = true;
   for (const colName of [...dataColumns, ...nonDataColumns]) {
    isWritten = isWritten && !getRangeBySheetColNameRowNum(sheet, colName, 1).isBlank();
  }
  if (isWritten) {
    console.log(`Header row for ${sheet.getName()} is already written`);
    return;
  }

  sheet.getRange('1:1').clearContent();

  for (const colName of [...dataColumns, ...nonDataColumns]) {
    const colLetter = getColLetterByColName(colName)
    sheet.getRange(`${colLetter}1`).setValue(colName)
    sheet.getRange(`${colLetter}1`).setTextStyle(SpreadsheetApp.newTextStyle().setBold(true).setFontSize(12).setFontFamily('Roboto').build())
  }
}

const getRandomSleepMs = (min = 100, max = 1000) => Math.random() * (max - min) + min;

