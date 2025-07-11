// pages/api/crypto-prices.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
    };
  };
}

interface CoinMarketCapResponse {
  data: {
    [key: string]: CryptoData;
  };
  status: {
    error_code: number;
    error_message?: string;
  };
}

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CryptoPrice[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.COINMARKETCAP_API;
  
  if (!apiKey) {
    return res.status(200).json({ error: 'CoinMarketCap API key not configured' });
  }

  try {
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,ADA,SOL,MATIC',
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json({ error: `CoinMarketCap API error: ${response.status}` });
    }

    const data: CoinMarketCapResponse = await response.json();

    if (data.status.error_code !== 0) {
      return res.status(200).json({ error: data.status.error_message || 'CoinMarketCap API error' });
    }

    const cryptoPrices: CryptoPrice[] = Object.values(data.data).map((crypto) => ({
      symbol: crypto.symbol,
      name: crypto.name,
      price: crypto.quote.USD.price,
      change24h: crypto.quote.USD.percent_change_24h,
      change7d: crypto.quote.USD.percent_change_7d,
      marketCap: crypto.quote.USD.market_cap,
    }));

    // Set cache headers (cache for 5 minutes)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(cryptoPrices);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return res.status(200).json({ 
      error: 'Network error while fetching crypto prices'
    });
  }
} 