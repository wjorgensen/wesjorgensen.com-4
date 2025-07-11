import { fileSystem, FileSystem, fetchPublicTextFile } from './filesystem';
import { getCurrentFolderContents as getContents } from './filesystem';

type CommandFunction = (args: string[], currentFolder: string[], setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>, changeThemeColor: (theme: string) => void) => string | { type: string; content: string } | Promise<string | { type: string; content: string }>;

export type CommandOutput = string | { type: string; content: string };

const commands: { [key: string]: CommandFunction } = {
  ls: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: ls [-a] [-l]\nList directory contents. Use -a to show hidden files, -l for long format.';
    }
    const contents = getContents(currentFolder);
    if (typeof contents !== 'object') {
      return `ls: cannot access '${currentFolder[currentFolder.length - 1]}': Not a directory`;
    }
    const showHidden = args.includes('-a');
    const longFormat = args.includes('-l');
    const files = Object.keys(contents).filter(file => showHidden || !file.startsWith('.'));
    
    if (longFormat) {
      return files.map(file => {
        const isDir = typeof contents[file] === 'object';
        const permissions = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? '4096' : '1024';
        const date = 'Dec 15 12:00';
        return `${permissions}  1 user user  ${size} ${date} ${file}`;
      }).join('\n') || 'total 0';
    }
    
    return files.join('  ') || 'Directory is empty';
  },
  
  cd: (args, currentFolder, setCurrentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: cd [directory]\nChange the current directory. Use ".." to go up one level.';
    }
    if (args.length === 0) {
      setCurrentFolder(['~']);
      return '';
    }
    
    let newFolder = [...currentFolder];
    const path = args[0].split('/').filter(segment => segment !== '');
    
    for (const segment of path) {
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        if (newFolder.length > 1) {
          newFolder.pop();
        }
      } else {
        const contents = getContents(newFolder);
        if (typeof contents === 'object' && contents[segment]) {
          newFolder.push(segment);
        } else {
          return `cd: ${args[0]}: No such file or directory`;
        }
      }
    }
    
    setCurrentFolder(newFolder);
    return '';
  },

  pwd: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: pwd\nPrint the current working directory.';
    }
    return currentFolder.join('/');
  },

  echo: (args) => {
    if (args.includes('--help')) {
      return 'Usage: echo [string...]\nDisplay a line of text.';
    }
    return args.join(' ');
  },

  whoami: (args) => {
    if (args.includes('--help')) {
      return 'Usage: whoami\nPrint effective username.';
    }
    return 'user';
  },

  uname: (args) => {
    if (args.includes('--help')) {
      return 'Usage: uname [-a]\nDisplay system information.';
    }
    if (args.includes('-a')) {
      return 'Linux wesjorgensen.com 5.15.0-terminal #1 SMP Thu Dec 15 12:00:00 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
    }
    return 'Linux';
  },

  date: (args) => {
    if (args.includes('--help')) {
      return 'Usage: date\nDisplay the current date and time.';
    }
    return new Date().toString();
  },

  uptime: (args) => {
    if (args.includes('--help')) {
      return 'Usage: uptime\nShow how long the system has been running.';
    }
    return 'up 17 days, 38 hours, 42 minutes, load average: 0.15, 0.12, 0.09';
  },

  ps: (args) => {
    if (args.includes('--help')) {
      return 'Usage: ps [aux]\nDisplay running processes.';
    }
    const processes = [
      'PID TTY          TIME CMD',
      '1234 pts/0    00:00:01 bash',
      '5678 pts/0    00:00:00 terminal',
      '9012 pts/0    00:00:00 ps'
    ];
    return processes.join('\n');
  },

  grep: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: grep [pattern] [file]\nSearch for patterns in files.';
    }
    if (args.length < 1) {
      return 'grep: missing pattern';
    }
    if (args.length < 2) {
      return 'grep: missing file operand';
    }
    
    const pattern = args[0];
    const fileName = args[1];
    const contents = getContents(currentFolder);
    
    if (typeof contents === 'object' && contents[fileName]) {
      const fileContent = contents[fileName];
      if (typeof fileContent === 'string') {
        const lines = fileContent.split('\n');
        const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
        return matches.length > 0 ? matches.join('\n') : `grep: no matches found for '${pattern}'`;
      } else {
        return `grep: ${fileName}: Is a directory`;
      }
    } else {
      return `grep: ${fileName}: No such file or directory`;
    }
  },

  find: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: find [path] -name [pattern]\nSearch for files and directories.';
    }
    
    const nameIndex = args.indexOf('-name');
    if (nameIndex === -1 || nameIndex === args.length - 1) {
      return 'find: missing -name argument';
    }
    
    const pattern = args[nameIndex + 1];
    const contents = getContents(currentFolder);
    
    if (typeof contents === 'object') {
      const matches = Object.keys(contents).filter(file => 
        file.toLowerCase().includes(pattern.toLowerCase())
      );
      return matches.length > 0 ? 
        matches.map(file => `./${file}`).join('\n') : 
        `find: no files matching '${pattern}'`;
    }
    
    return 'find: current directory is not accessible';
  },

  touch: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: touch [file]\nCreate an empty file or update timestamp.';
    }
    if (args.length === 0) {
      return 'touch: missing file operand';
    }
    return `touch: cannot create '${args[0]}': Permission denied (read-only filesystem)`;
  },

  mkdir: (args) => {
    if (args.includes('--help')) {
      return 'Usage: mkdir [directory]\nCreate directories.';
    }
    if (args.length === 0) {
      return 'mkdir: missing operand';
    }
    return `mkdir: cannot create directory '${args[0]}': Permission denied (read-only filesystem)`;
  },

  rmdir: (args) => {
    if (args.includes('--help')) {
      return 'Usage: rmdir [directory]\nRemove empty directories.';
    }
    if (args.length === 0) {
      return 'rmdir: missing operand';
    }
    return `rmdir: failed to remove '${args[0]}': Directory not empty or permission denied`;
  },

  cat: async (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: cat <filename>\nDisplay the contents of a file.';
    }
    if (args.length === 0) return 'cat: missing file operand';
    
    const fileName = args[0];
    
    // First, try to fetch from public folder if it's a .txt file
    if (fileName.endsWith('.txt')) {
      try {
        const publicContent = await fetchPublicTextFile(fileName);
        if (publicContent !== null) {
          // Check if content looks like HTML
          if (publicContent.includes('<') && publicContent.includes('>')) {
            return { type: 'html', content: publicContent };
          }
          return publicContent;
        }
      } catch (error) {
        // Fall through to filesystem check
      }
    }
    
    // Fallback to filesystem
    const contents = getContents(currentFolder);
    if (typeof contents === 'object' && contents[fileName]) {
      const fileContent = contents[fileName];
      if (typeof fileContent === 'string') {
        return fileContent;
      } else {
        return `Error: ${fileName} is a directory`;
      }
    } else {
      return `Error: ${fileName} not found`;
    }
  },

  help: () => {
    const allCommands = Object.keys(commands);
    return `Available commands: ${allCommands.join(', ')}</br>Use <command> --help for more information on a specific command.`;
  },

  clear: (args) => {
    if (args.includes('--help')) {
      return 'Usage: clear\nClear the terminal screen.';
    }
    return 'CLEAR_TERMINAL';
  },

  theme: (args, _, __, changeThemeColor) => {
    if (args.includes('--help')) {
      return 'Usage: theme <option>\nChange the terminal theme. Available options: light, dark';
    }
    if (args.length === 0) return 'Usage: theme <option>\nAvailable options: light, dark';
    const theme = args[0].toLowerCase();
    if (theme !== 'light' && theme !== 'dark') {
      return 'Invalid theme. Available options: light, dark';
    }
    changeThemeColor(theme);
    return `Theme changed to ${theme}`;
  },

  python: async (args) => {
    if (args.includes('--help')) {
      return 'Usage: python <script.py>\nRun a Python script.';
    }
    if (args.length === 0) {
      return 'python: can\'t open file \'\': [Errno 2] No such file or directory';
    }
    
    const script = args[0];
    if (script === 'snake.py') {
      return 'Starting Snake game...';
    } else if (script === 'blockchain.py') {
      // Handle blockchain.py directly
      try {
        const response = await fetch('/api/crypto-prices');
        
        if (!response.ok) {
          return 'NETWORK ERROR';
        }
        
        const data = await response.json();
        
        if ('error' in data) {
          return 'NETWORK ERROR';
        }
        
        const formatPrice = (price: number | null) => {
          if (price === null) return 'N/A';
          if (price >= 1) {
            return price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            });
          } else {
            return price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 4,
              maximumFractionDigits: 6 
            });
          }
        };
        
        const formatChange = (change: number) => {
          const trend = change >= 0 ? 'UP' : 'DOWN';
          const sign = change >= 0 ? '+' : '';
          return `${sign}${change.toFixed(2)}% ${trend}`;
        };
        
        const formatMarketCap = (marketCap: number | null) => {
          if (marketCap === null) return 'N/A';
          if (marketCap >= 1e12) {
            return `$${(marketCap / 1e12).toFixed(2)}T`;
          } else if (marketCap >= 1e9) {
            return `$${(marketCap / 1e9).toFixed(2)}B`;
          } else if (marketCap >= 1e6) {
            return `$${(marketCap / 1e6).toFixed(2)}M`;
          } else {
            return `$${marketCap.toLocaleString()}`;
          }
        };
        
        let output = 'CRYPTO MARKET DATA\n\n';
        
        // Filter to only show Bitcoin and Ethereum
        const filteredData = data.filter((crypto: any) => 
          crypto.symbol === 'BTC' || crypto.symbol === 'ETH'
        );
        
        filteredData.forEach((crypto: any) => {
          const change24h = formatChange(crypto.change24h);
          const marketCap = formatMarketCap(crypto.marketCap);
          
          output += `${crypto.name} (${crypto.symbol}): ${formatPrice(crypto.price)}\n`;
          output += `  24h: ${change24h} | Market Cap: ${marketCap}\n\n`;
        });
        

        
        return output;
        
      } catch (error) {
        return 'NETWORK ERROR';
      }
    } else {
      return `python: can't open file '${script}': [Errno 2] No such file or directory`;
    }
  },

  history: (args) => {
    if (args.includes('--help')) {
      return 'Usage: history\nDisplay the command history.';
    }
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      const historyList = JSON.parse(savedHistory);
      return historyList.map((cmd: string, index: number) => 
        `${historyList.length - index} ${cmd}`
      ).join('\n');
    }
    return 'No history available.';
  },

  neofetch: () => ({ 
      type: 'html', 
      content: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠙⠙⠋⠉⠁⠉⠀⠀⠘⠉⠉⠻⠉⠻⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;user@wesjorgensen.com</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;----------------------------</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;OS: BasedOS 13.5 22g74 arm64</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Host: Mcdonalds14,9</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠆⠀⠀⠀⠀⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Kernel: 69.420.0</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Uptime: 17 days, 38 hours</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠈⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⡶⣶⡄⣤⢀⣀⡀⠀⠀⠀⠀⠀⢚⢤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⠟⠁⠈⠋⣻⣿⣶⣄⠀⠀⠀⢸⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⡢⠛⠿⢿⣿⡄⠀⠄⣸⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⣒⠀⠀⠀⠀⠀⠀⠈⠃⠈⠍⢻⡏⠀⢰⣟⡇⠂⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠰⣿⡻⡾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⠛⠿⡧⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢿⠀⢠⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡄⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⢸⠀⠀⠙⢿⣇⠀⠀⠀⠀⠲⢤⣴⠆⡀⠀⠀⠀⢸⡀⠀⠀⠀⠁⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠩⠿⠀⠀⣠⡀⠀⢇⢠⣤⡠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠉⠀⠸⣆⡻⡇⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⡎⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣧⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⢡⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠈⠿⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢸⣽⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢤⣀⠉⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢃⣾⡯⠀⠀⠐⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠃⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⢿⣿⣿⣿⣿⣿⠿⠿⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⠉⠉⣀⣾⣿⣏⡄⠀⠀⢰⣷⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⡿⠋⠀⠀⣸⡿⢱⠛⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣹⡿⠹⡏⣰⣎⠀⠀⣽⡇⡤⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣹⠁⣾⢴⣿⡋⠀⢀⣾⣿⡟⠆⠀⠀⠀⠀⠀⢠⣶⣦⣤⣄⣄⣀⣀⣀⠺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⣼⢿⡀⢿⡁⠀⢀⣿⠟⠀⠀⢀⡀⢁⣶⣿⣿⣿⣿⣿⣿⡿⠙⢽⣿⣿⣦⣝⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢯⣽⡇⣾⡇⠀⢸⡟⠀⠀⠀⣼⣿⣿⠟⢻⣿⣿⣿⣿⣿⠇⠀⠈⠁⠉⠻⣿⣷⣬⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⢠⢹⡿⠀⠀⠀⠀⠀⠀⠈⠛⠃⠀⠰⣶⣿⣿⣿⡟⠀⠀⠀⠀⠀⠁⠘⢿⣿⣿⣮⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢻⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠟⠛⣻⠏⠀⠀⠀⠀⠀⠀⠀⠘⠀⠡⣽⣿⣷⡜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣼⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠟⠁⠀⣸⣿⡀⠀⠀⠀⠀⣠⡄⠀⠀⠀⠀⢀⣻⣿⣿⣎⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⣠⣤⢤⣤⣴⣾⣿⣯⣥⣤⣶⣶⠟⠻⠛⠉⣸⣿⣾⣿⣿⣿⣮⡻⣷⡙⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠚⡿⠿⠟⠛⠻⠟⢻⣏⣩⣿⣿⡇⠀⠀⠀⠊⢘⣛⠻⣿⣿⣿⣿⣷⣾⣿⣮⣛⠻⢿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡀⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣿⠃⠸⠍⠫⢿⠿⣿⣿⣮⣽⣿⣿⣿⣿⣿⣿⣿⣿⣦⡙⢿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠻⢿⡟⠀⠀⠀⠠⣎⠀⣸⡿⢿⣿⢿⠟⣛⣿⣟⣿⣿⣿⣿⣿⣦⣙⢿</br>'
  }),

  // Easter Egg Commands
  sl: (args) => {
    if (args.includes('--help')) {
      return 'Usage: sl\nDisplays a steam locomotive (you meant to type "ls", didn\'t you?)';
    }
    return { 
      type: 'html', 
      content: '<pre>                      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @<br/>                 (@@@)<br/>             (    )<br/>          (@@@@)<br/>       (   )<br/><br/>    ====        ________                ___________<br/>_D _|  |_______/        \\__I_I_____===__|_________|<br/> |(_)---  |   H\\________/ |   |        =|___ ___|<br/> /     |  |   H  |  |     |   |         ||_| |_||<br/>|      |  |   H  |__--------------------| [___] |<br/>| ________|___H__/__|_____/[][]~\\_______|       |<br/>|/ |   |-----------I_____I [][] []  D   |=======|<br/>__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|<br/> |/-=|___|=    ||    ||    ||    |_____/~\\___/<br/>  \\_/      \\O=====O=====O=====O_/      \\_/</pre>'
    };
  },

  vlc: async (args) => {
    if (args.includes('--help')) {
      return 'Usage: vlc <movie>\nPlay a movie file. Available movies: starwars.mov';
    }
    
    if (args.length === 0) {
      return 'vlc: no input files';
    }
    
    const movieFile = args[0];
    if (movieFile !== 'starwars.mov') {
      return `vlc: cannot open '${movieFile}': No such file or directory`;
    }
    
    try {
      // Load the Star Wars text file
      const response = await fetch('/sw1.txt');
      if (!response.ok) {
        return 'vlc: error loading movie file';
      }
      
      const movieData = await response.text();
      const lines = movieData.split('\n');
      
      // Parse frames
      const frames: Array<{ duration: number; content: string }> = [];
      let currentIndex = 0;
      
      while (currentIndex < lines.length) {
        // Skip empty lines
        if (lines[currentIndex].trim() === '') {
          currentIndex++;
          continue;
        }
        
        // First line should be the frame duration
        const duration = parseInt(lines[currentIndex].trim());
        if (isNaN(duration)) {
          currentIndex++;
          continue;
        }
        
        // Next 13 lines are the frame content (14 lines total per frame)
        const frameLines = [];
        for (let i = 1; i < 14; i++) {
          if (currentIndex + i < lines.length) {
            frameLines.push(lines[currentIndex + i]);
          } else {
            frameLines.push('');
          }
        }
        
        frames.push({
          duration,
          content: frameLines.join('\n')
        });
        
        currentIndex += 14;
      }
      
      return {
        type: 'starwars',
        content: JSON.stringify(frames)
      };
      
    } catch (error) {
      return 'vlc: error reading movie file';
    }
  },

  cowsay: (args) => {
    if (args.includes('--help')) {
      return 'Usage: cowsay [text]\nMakes a cow say something.';
    }
    const text = args.length > 0 ? args.join(' ') : 'Hello from the terminal!';
    const textLength = text.length;
    const border = '-'.repeat(textLength + 2);
    
    return { 
      type: 'html', 
      content: `<pre> ${border}<br/>< ${text} ><br/> ${border}<br/>        \\   ^__^<br/>         \\  (oo)\\_______<br/>            (__)\\       )\\/\\<br/>                ||----w |<br/>                ||     ||</pre>`
    };
  },
};

export async function executeCommand(
  command: string, 
  args: string[], 
  currentFolder: string[], 
  setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>,
  changeThemeColor: (theme: string) => void
): Promise<CommandOutput | 'CLEAR_TERMINAL'> {
  if (commands[command]) {
    const result = commands[command](args, currentFolder, setCurrentFolder, changeThemeColor);
    // Handle both sync and async commands
    return await Promise.resolve(result);
  } else {
    return `Command not found: ${command}. Type 'help' for a list of available commands.`;
  }
}

// Export the blockchain command for special handling
export { commands };

export const getAvailableCommands = () => {
  return Object.keys(commands);
};

export function getCurrentFolderContents(currentFolder: string[]): FileSystem | string {
  let current: FileSystem | string = fileSystem;
  
  // If we're at the root, return the contents of '~'
  if (currentFolder.length === 1 && currentFolder[0] === '~') {
    return fileSystem['~'] as FileSystem;
  }

  for (const folder of currentFolder) {
    if (folder === '~') {
      current = fileSystem['~'] as FileSystem;
    } else if (typeof current === 'object' && current[folder]) {
      current = current[folder];
    } else {
      return 'Invalid path';
    }
  }
  return current;
}