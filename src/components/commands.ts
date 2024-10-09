import { fileSystem, FileSystem } from './filesystem';
import { getCurrentFolderContents as getContents } from './filesystem';

type CommandFunction = (args: string[], currentFolder: string[], setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>, changeThemeColor: (theme: string) => void) => string | { type: string; content: string };

export type CommandOutput = string | { type: string; content: string };

const commands: { [key: string]: CommandFunction } = {
  ls: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: ls [-a]\nList directory contents. Use -a to show hidden files.';
    }
    const contents = getContents(currentFolder);
    if (typeof contents !== 'object') {
      return `ls: cannot access '${currentFolder[currentFolder.length - 1]}': Not a directory`;
    }
    const showHidden = args.includes('-a');
    const files = Object.keys(contents).filter(file => showHidden || !file.startsWith('.'));
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
  
  cat: (args, currentFolder) => {
    if (args.includes('--help')) {
      return 'Usage: cat <filename>\nDisplay the contents of a file.';
    }
    if (args.length === 0) return 'cat: missing file operand';
    
      const fileName = args[0];
      const contents = getCurrentFolderContents(currentFolder);
      if (typeof contents === 'object' && contents[fileName]) {
        const fileContent = contents[fileName];
        if (typeof fileContent === 'string') {
          // Check if the content is HTML (for .sus.txt)
          if (fileName === '.sus.txt') {
            return { type: 'html', content: fileContent };
          }
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

  snake: (args) => {
    if (args.includes('--help')) {
      return 'Usage: snake\nStart the Snake game.';
    }
    return 'Starting Snake game...';
  },

  neofetch: () => ({ 
      type: 'html', 
      content: '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠙⠙⠋⠉⠁⠉⠀⠀⠘⠉⠉⠻⠉⠻⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;user@wesjorgensen.com</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;----------------------------</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;OS: BasedOS 13.5 22g74 arm64</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Host: Mcdonalds14,9</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠆⠀⠀⠀⠀⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Kernel: 69.420.0</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Uptime: 17 days, 38 hours</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠈⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>      ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⡶⣶⡄⣤⢀⣀⡀⠀⠀⠀⠀⠀⢚⢤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⠟⠁⠈⠋⣻⣿⣶⣄⠀⠀⠀⢸⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⡢⠛⠿⢿⣿⡄⠀⠄⣸⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⣒⠀⠀⠀⠀⠀⠀⠈⠃⠈⠍⢻⡏⠀⢰⣟⡇⠂⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠰⣿⡻⡾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⠛⠿⡧⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢿⠀⢠⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡄⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⢸⠀⠀⠙⢿⣇⠀⠀⠀⠀⠲⢤⣴⠆⡀⠀⠀⠀⢸⡀⠀⠀⠀⠁⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠩⠿⠀⠀⣠⡀⠀⢇⢠⣤⡠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠉⠀⠸⣆⡻⡇⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⡎⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣧⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⢡⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠈⠿⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢸⣽⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢤⣀⠉⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢃⣾⡯⠀⠀⠐⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠃⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⢿⣿⣿⣿⣿⣿⠿⠿⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⠉⠉⣀⣾⣿⣏⡄⠀⠀⢰⣷⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⡿⠋⠀⠀⣸⡿⢱⠛⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣹⡿⠹⡏⣰⣎⠀⠀⣽⡇⡤⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣹⠁⣾⢴⣿⡋⠀⢀⣾⣿⡟⠆⠀⠀⠀⠀⠀⢠⣶⣦⣤⣄⣄⣀⣀⣀⠺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⣼⢿⡀⢿⡁⠀⢀⣿⠟⠀⠀⢀⡀⢁⣶⣿⣿⣿⣿⣿⣿⡿⠙⢽⣿⣿⣦⣝⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢯⣽⡇⣾⡇⠀⢸⡟⠀⠀⠀⣼⣿⣿⠟⢻⣿⣿⣿⣿⣿⠇⠀⠈⠁⠉⠻⣿⣷⣬⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⢠⢹⡿⠀⠀⠀⠀⠀⠀⠈⠛⠃⠀⠰⣶⣿⣿⣿⡟⠀⠀⠀⠀⠀⠁⠘⢿⣿⣿⣮⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢻⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠟⠛⣻⠏⠀⠀⠀⠀⠀⠀⠀⠘⠀⠡⣽⣿⣷⡜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣼⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠟⠁⠀⣸⣿⡀⠀⠀⠀⠀⣠⡄⠀⠀⠀⠀⢀⣻⣿⣿⣎⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⣠⣤⢤⣤⣴⣾⣿⣯⣥⣤⣶⣶⠟⠻⠛⠉⣸⣿⣾⣿⣿⣿⣮⡻⣷⡙⣿⣿⣿⣿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠚⡿⠿⠟⠛⠻⠟⢻⣏⣩⣿⣿⡇⠀⠀⠀⠊⢘⣛⠻⣿⣿⣿⣿⣷⣾⣿⣮⣛⠻⢿⣿⣿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡀⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣿⠃⠸⠍⠫⢿⠿⣿⣿⣮⣽⣿⣿⣿⣿⣿⣿⣿⣿⣦⡙⢿⣿⣿</br>⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠻⢿⡟⠀⠀⠀⠠⣎⠀⣸⡿⢿⣿⢿⠟⣛⣿⣟⣿⣿⣿⣿⣿⣦⣙⢿</br>'
  }),
};

export function executeCommand(
  command: string, 
  args: string[], 
  currentFolder: string[], 
  setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>,
  changeThemeColor: (theme: string) => void
): CommandOutput {
  if (commands[command]) {
    return commands[command](args, currentFolder, setCurrentFolder, changeThemeColor);
  } else {
    return `Command not found: ${command}. Type 'help' for a list of available commands.`;
  }
};

export const getAvailableCommands = () => {
  return [
    'help', 'clear', 'echo', 'ls', 'cd', 'pwd', 'cat', 'theme',
  ];
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