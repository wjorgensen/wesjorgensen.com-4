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
        'rank-rushd.txt': 'A higher or lower game based on Letterboxd.com scores <br /><a target="blank" href="https://rankrushd.gg">Check it out</a><br /><a target="blank" href="https://github.com/wjorgensen/RankRushd">Check out the code</a>',
        'README.md': 'This is a selection of my favorite projects that I\'ve built. I\'ve been developing with Solidity, Next.js, Java, and Python for the past 5 years. I\'m constantly working on new projects and learning more. If you ever want to work on something together my DM\'s on twitter are open @Wezabis',
      },
      'about-me.txt': 'Hello, my name is Wes Jorgensen. I\'m a junior at BU studying Computer Science and Economcis. I\'m very intrested in blockchain technology and it\'s applications. I\'m the President of BU Blockchain and spend a lot of my time trying to grow the club. I want to be an entrepreneur in the blockchain space and am working on several side projects currently.',
      'socials.txt': 'Twitter: <a target="blank" href="x.com/wezabis">@Wezabis</a><br />Github: <a target="blank" href="gtihub.com/wjorgensen">Wjorgensen</a>',
      'help.txt': 'Available commands: help, ls, cd, cat, clear',
      '.sus.txt': '⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠉⢁⣀⣀⣀⡈⠉⠛⢿⡿⠿⢿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⠏⢀⣴⣾⣿⣿⣿⣿⣿⡟⠃⢀⣀⣤⣤⣄⠉⢿⣿<br />⣿⣿⣿⣿⣿⡏⠀⣾⣿⣿⣿⣿⣿⣿⠏⠀⣴⣿⣿⣿⣯⣻⣧⠀⢻<br />⣿⣿⣿⣿⣿⠁⢸⣿⣿⣿⣿⣿⣿⣿⠀⠸⣿⣿⣿⣿⣿⣿⣿⡇⠈<br />⣿⣿⣿⣿⡏⠀⣼⣿⣿⣿⣿⣿⣿⣿⣧⠀⠹⢿⣿⣿⣿⡿⠟⠀⣼<br />⣿⣿⣿⡿⠇⠀⠛⠿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⡈⠉⠀⠀⣴⣿⣿<br />⣿⡿⠁⣀⢠⢤⣤⠀⠀⠉⢀⠀⠀⠈⠉⠻⢿⣿⣿⣿⡇⠀⣿⣿⣿<br />⡟⠀⣴⣽⣷⣷⠆⠀⣴⣾⣿⣔⡳⢦⡄⣄⣠⣿⣿⣿⡇⠀⣿⣿⣿<br />⠀⢰⣿⣿⣿⠇⠀⣼⣿⣿⣿⣿⣿⣷⣶⣿⣿⣿⣿⣿⣿⠀⢻⣿⣿<br />⠀⠸⣾⣿⣿⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⣿<br />⣧⠀⠻⢿⣿⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⣿<br />⣿⣷⣤⣀⣈⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⠟⠙⣿⣿⣿⡏⠀⣼⣿⣿<br />⣿⣿⣿⣿⣿⡇⠀⣄⠀⠙⠛⠿⠿⠛⠁⢀⣼⣿⣿⣿⡇⠀⣿⣿⣿<br />⣿⣿⣿⣿⣿⣷⡀⠘⠿⠶⠀⢀⣤⣤⡀⠙⢿⣿⣿⡿⠁⢰⣿⣿⣿<br />⢻⣿⣿⣿⣿⣿⣿⣦⣤⣤⣴⣿⣿⣿⣷⣄⣀⠈⠁⣀⣠⣿⣿⣿⣿<br />⣹⣿⣿⣿⡿⢋⣩⣬⣩⣿⠃⣿⣿⣿⣿⢸⣿⡿⢋⣡⣬⣩⣿⣿⣿<br />⡗⣿⣿⣿⣧⣈⣛⠛⠻⣿⠀⣿⣿⣿⡿⢸⣿⣧⣈⣛⠛⠻⣿⣿⣿<br />⣿⣿⣿⣿⠹⣿⣿⡿⠂⣿⣇⠸⣿⣿⠃⣼⣿⠻⣿⣿⡿⠀⣿⣿⣿<br />⣿⣿⣿⣿⣶⣤⣤⣴⣾⣿⣿⣶⣤⣤⣾⣿⣿⣶⣤⣤⣴⣾⣿⣿⣿',
    },
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
