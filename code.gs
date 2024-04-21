/**
 * How to use:
 * 1. Define dexscreener data in crypto-config.gs
 * 2. Define cmc data in cmc.gs
 * 3. Update worksheet-config.gs according to the columns to be displayed
 * 4. Create a sheet with the ticker name
 */

function updateCryptoData() {
  const start = new Date();
  process();
  const end = new Date();
  const timeElapsed = (end.getTime() - start.getTime()) / 1000;
  console.log(`Took ${timeElapsed} seconds to process`);
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
    const { priceUsd, priceNative, volume, priceChange, liquidity, txns, quoteToken, chainId, url } = dexscreenerData.pairs[0];
    

    // dex screener data columns
    getRangeBySheetColNameRowNum(sheet, 'Date', nextRowNum).setValue(new Date())
    getRangeBySheetColNameRowNum(sheet, 'Price USD', nextRowNum).setValue(priceUsd);
    getRangeBySheetColNameRowNum(sheet, 'Price native', nextRowNum).setValue(priceNative);
    getRangeBySheetColNameRowNum(sheet, 'Price change 24h', nextRowNum).setValue(priceChange.h24);
    getRangeBySheetColNameRowNum(sheet, 'Volume 24h', nextRowNum).setValue(volume.h24);
    getRangeBySheetColNameRowNum(sheet, 'Num transaction buy 24h', nextRowNum).setValue(txns.h24.buys);
    getRangeBySheetColNameRowNum(sheet, 'Num transaction sell 24h', nextRowNum).setValue(txns.h24.sells);
    getRangeBySheetColNameRowNum(sheet, 'Liquidity base', nextRowNum).setValue(liquidity.base);
    getRangeBySheetColNameRowNum(sheet, 'Liquidity quote', nextRowNum).setValue(liquidity.quote);
    getRangeBySheetColNameRowNum(sheet, 'Liquidity USD', nextRowNum).setValue(liquidity.usd);
    

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
  }
}

const updateCmcData = (sheet, config, ticker, nextRowNum) => {
  // cmc data columns
    if (config.cmcId == null || config.cmcId === '') {
      console.log(`CMC id is not defined for ${ticker}`);
      return
    }
    const cmcData = cmcCoinDetail(config.cmcId).data;
    const { watchCount, watchListRanking, isInfiniteMaxSupply, selfReportedCirculatingSupply,
      statistics: {volumeRank, volumeMcRank, circulatingSupply, totalSupply, maxSupply,  marketCap, fullyDilutedMarketCap, rank},
      holders
    } = cmcData;
    getRangeBySheetColNameRowNum(sheet, 'Self reported circulating supply', nextRowNum).setValue(selfReportedCirculatingSupply);
    getRangeBySheetColNameRowNum(sheet, 'Circulating supply', nextRowNum).setValue(circulatingSupply);
    getRangeBySheetColNameRowNum(sheet, 'Total supply', nextRowNum).setValue(totalSupply);
    getRangeBySheetColNameRowNum(sheet, 'Max supply', nextRowNum).setValue(maxSupply);
    getRangeBySheetColNameRowNum(sheet, 'Market cap', nextRowNum).setValue(marketCap);
    getRangeBySheetColNameRowNum(sheet, 'Fully diluted market cap', nextRowNum).setValue(fullyDilutedMarketCap);
    getRangeBySheetColNameRowNum(sheet, 'Rank', nextRowNum).setValue(rank);
    getRangeBySheetColNameRowNum(sheet, 'Watch count', nextRowNum).setValue(watchCount);
    getRangeBySheetColNameRowNum(sheet, 'Watchlist ranking', nextRowNum).setValue(watchListRanking)
    getRangeBySheetColNameRowNum(sheet, 'Volume rank', nextRowNum).setValue(volumeRank);
    getRangeBySheetColNameRowNum(sheet, 'Volume mc rank', nextRowNum).setValue(volumeMcRank);
    getRangeBySheetColNameRowNum(sheet, 'Is infinite max supply', nextRowNum).setValue(isInfiniteMaxSupply ? 'true' : 'false');

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
      getRangeBySheetColNameRowNum(sheet, 'Holder count', nextRowNum).setValue(holderCount);
      getRangeBySheetColNameRowNum(sheet, 'Top 10 holder ratio', nextRowNum).setValue(thresholdCountToRatio[10]);
      getRangeBySheetColNameRowNum(sheet, 'Top 20 holder ratio', nextRowNum).setValue(thresholdCountToRatio[20]);
      getRangeBySheetColNameRowNum(sheet, 'Top 50 holder ratio', nextRowNum).setValue(thresholdCountToRatio[50]);
      getRangeBySheetColNameRowNum(sheet, 'Top 100 holder ratio', nextRowNum).setValue(thresholdCountToRatio[100]);
    }

}

const writeHeaderRow = (sheet) => {
  sheet.getRange('1:1').clearContent();

  for (const colName of [...dataColumns, ...nonDataColumns]) {
    const colLetter = getColLetterByColName(colName)
    sheet.getRange(`${colLetter}1`).setValue(colName)
    sheet.getRange(`${colLetter}1`).setTextStyle(SpreadsheetApp.newTextStyle().setBold(true).setFontSize(12).setFontFamily('Roboto').build())
  }
  
}

