// fileSystem.ts
export interface FileSystem {
    [key: string]: string | FileSystem;
  }
  
  export const fileSystem: FileSystem = {
    '~': {
      'projects': {
        '617DAO.txt': 'The DAO used by BU Blockchain to prove membership, check attendance, make the club more democratic, and get students on chain<br /><a target="blank" href="https://dao.bublockchain.com">Check it out</a><br /><a target="blank" href="https://github.com/bublockchain/617DAO">Check out the code</a>',
        'Raized.txt': 'Winner of the 2024 Stacks x EasyA Hackathon @ Harvard. Raized is a new model for crowdfunding only possible on chain. It allows donators to gaoin access to a DAO where they vote on progress updates to give the project creator the next milestone of funding <br /><a target="blank" href="https://github.com/s-alad/raized">Check out the code</a>',
        'this-website.txt': 'This is the fourth version of my personal website and is a good representation of my current Next.js skills',
        'rank-rushd.txt': 'A higher or lower game based on Letterboxd.com scores <br /><a target="blank" href="https://rankrushd.wesjorgensen.com">Check it out</a><br /><a target="blank" href="https://github.com/wjorgensen/RankRushd">Check out the code</a>',
        'README.md': 'This is a selection of my favorite projects that I\'ve built. I\'ve been developing with Solidity, Next.js, Java, and Python for the past 5 years. I\'m constantly working on new projects and learning more. If you ever want to work on something together my DM\'s on twitter are open @Wezabis',
      },
      'about-me.txt': 'Hello, my name is Wes Jorgensen. Im a full stack developer that likes making cool stuff. To see what I\'ve built check out my github and twitter. Peace',
      'socials.txt': 'Twitter: <a target="blank" href="https://x.com/wezabis">@Wezabis</a><br />Github: <a target="blank" href="https://github.com/wjorgensen">Wjorgensen</a>',
      'snake.py': '#!/usr/bin/env python3\n# Snake Game for Terminal\n# A classic snake game implementation\n# Run with: python snake.py\n\nprint("🐍 Starting Snake Game...")\nprint("Use WASD keys to control the snake")\nprint("Eat the food (🍎) to grow longer")\nprint("Don\'t hit the walls or yourself!")\nprint("Good luck!")',
      'blockchain.py': '#!/usr/bin/env python3\n# Cryptocurrency Price Tracker\n# Real-time crypto market data fetcher\n# Run with: python blockchain.py\n\nimport requests\nimport json\nfrom datetime import datetime\n\n# CoinMarketCap API integration\nAPI_ENDPOINT = "/api/crypto-prices"\n\nprint("🚀 Blockchain.py - Crypto Price Tracker")\nprint("Fetching real-time cryptocurrency data...")\nprint("Source: CoinMarketCap API")\nprint("=" * 50)\n\n# This script connects to the real API endpoint\n# See /api/crypto-prices for implementation details',
      'starwars.mov': 'Star Wars Episode IV: A New Hope - ASCII Animation\nOriginal ASCII animation from asciimation.co.nz\nTo play this movie, use: vlc starwars.mov',
      'meme.txt': '[File available from public folder]', // Placeholder to show in ls
    },
  };

  // Function to fetch real .txt files from public folder
  export const fetchPublicTextFile = async (fileName: string): Promise<string | null> => {
    try {
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  export const getCurrentFolderContents = (currentFolder: string[]): FileSystem | string => {
    if (currentFolder.length === 1 && currentFolder[0] === '~') {
      return fileSystem['~'] as FileSystem;
    }

    return currentFolder.reduce((acc: FileSystem | string, folder: string, index: number) => {
      if (index === 0 && folder === '~') {
        return fileSystem['~'] as FileSystem;
      }
      if (typeof acc === 'object' && acc[folder]) {
        return acc[folder];
      }
      return {};
    }, fileSystem as FileSystem);
  };
