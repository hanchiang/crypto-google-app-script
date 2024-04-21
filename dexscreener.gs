
const getDexScreenerPairInfo = (chain, pairAddress) => {
  const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;
  const response = UrlFetchApp.fetch(url);
  if (response.getResponseCode() >= 400) {
    const msg = `error fetching from ${url}, response: ${response}`;
    console.log(msg)
    throw new Error(msg);
  }
  return JSON.parse(UrlFetchApp.fetch(url).getContentText());
}
