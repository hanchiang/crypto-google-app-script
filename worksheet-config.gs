const dataColumns = [
  // mostly dex screener
  'Date', 'Price USD', 'Price native', 'Price change 24h',  'Volume 24h', 'Volume change 24h', 'Num transaction buy 24h', 'Num transaction sell 24h', 'Liquidity base', 'Liquidity quote', 'Liquidity USD',
  // mostly cmc
   'Self reported circulating supply', 'Circulating supply', 'Total supply', 'Max supply', 'Market cap', 'Fully diluted market cap', 'Rank', 'Watch count',
  'Watchlist ranking', 'Volume rank', 'Volume mc rank', 'Holder count', 'Top 10 holder ratio', 'Top 20 holder ratio', 'Top 50 holder ratio', 'Top 100 holder ratio', 'Is infinite max supply',
]

const nonDataColumns = ['Ticker', 'Quote ticker', 'Chain',  'Link']

const dataColumnsToIndex = {};
for (const col of dataColumns) {
  dataColumnsToIndex[col] = dataColumns.indexOf(col);
}
const nonDataColumnsToIndex = {};
for (const col of nonDataColumns) {
  nonDataColumnsToIndex[col] = nonDataColumns.indexOf(col);
}

const firstDataColLetter = 'A';
const lastDataColLetter = String.fromCharCode(firstDataColLetter.charCodeAt() + dataColumns.length - 1); 
const firstNonDataColLetter = String.fromCharCode(firstDataColLetter.charCodeAt() + dataColumns.length);
const lastNonDataColLetter = String.fromCharCode(firstNonDataColLetter.charCodeAt() + nonDataColumns.length - 1); 

const charCodeToLetters = (code) => {
  const zCharCode = 'Z'.charCodeAt();
  const aCharCode = 'A'.charCodeAt();
  if (code <= zCharCode) {
    return String.fromCharCode(code);
  }
  // at least 2 letters
  let result = '';
  // A = 65, Z = 90, AA = 90 + 1 = 91, ZZ = 90 + 26 = 116
  if (code > zCharCode) {
    code -= zCharCode;
    result += 'A';
  }
  while (code >= aCharCode) {
    code -= aCharCode;
    result += 'A';
  }
  return result + String.fromCharCode('A'.charCodeAt() - 1 + code);
}

const isDataCol = (colName) => dataColumns.indexOf(colName) !== -1;
const getColumnIndexByColName = (colName) => isDataCol(colName) ? dataColumnsToIndex[colName] : nonDataColumnsToIndex[colName];
const getColLetterByColName = (colName) => {
  let letters;
  if (isDataCol(colName)) {
    letters = charCodeToLetters(firstDataColLetter.charCodeAt() + getColumnIndexByColName(colName));
  } else {
    letters = charCodeToLetters(firstNonDataColLetter.charCodeAt() + getColumnIndexByColName(colName));
  }
  console.log({ colName, letters })
  return letters;
} 
const getRangeBySheetColNameRowNum = (sheet, colName, rowNum) => sheet.getRange(`${getColLetterByColName(colName)}${rowNum}`);


