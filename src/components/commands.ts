// commands.ts
import { FileSystem, getCurrentFolderContents } from './fileSystem';

type CommandFunction = (args: string[], currentFolder: string[], setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>, changeThemeColor: (theme: string) => void) => string;

const commands: { [key: string]: CommandFunction } = {
  ls: (args, currentFolder) => {
    const contents = getCurrentFolderContents(currentFolder);
    if (typeof contents !== 'object') {
      return `ls: cannot access '${currentFolder[currentFolder.length - 1]}': Not a directory`;
    }
    const showHidden = args.includes('-a');
    const files = Object.keys(contents).filter(file => showHidden || !file.startsWith('.'));
    return files.join('  ') || 'Directory is empty';
  },
  
  cd: (args, currentFolder, setCurrentFolder) => {
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
        const contents = getCurrentFolderContents(newFolder);
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
    if (args.length === 0) return 'cat: missing file operand';
    
    const contents = getCurrentFolderContents(currentFolder);
    const filename = args[0];
    
    if (typeof contents === 'object' && typeof contents[filename] === 'string') {
      return contents[filename] as string;
    } else if (typeof contents === 'object' && typeof contents[filename] === 'object') {
      return `cat: ${filename}: Is a directory`;
    } else {
      return `cat: ${filename}: No such file or directory`;
    }
  },
  
  help: () => 'Available commands: help, ls, cd, cat, clear',
  
  clear: () => 'CLEAR_TERMINAL',

  theme: (args, _, __, changeThemeColor) => {
    if (args.length === 0) return 'Usage: changeColor <color>';
    const theme = args[0];
    changeThemeColor(theme);
    return `Theme changed to ${theme}`;
  },

  snake: () => {
    return 'Starting Snake game...';
  },

  neofetch: () => '⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠙⠙⠋⠉⠁⠉⠀⠀⠘⠉⠉⠻⠉⠻⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;user@wesjorgensen.com<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;----------------------------<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;OS: SigmaOS 13.5 22g74 arm64<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Host: UrMomsHouse14,9<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠆⠀⠀⠀⠀⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Kernel: 69.420.0<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿       &nbsp;&nbsp;Uptime: 17 days, 38 hours<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠈⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿        <br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⡶⣶⡄⣤⢀⣀⡀⠀⠀⠀⠀⠀⢚⢤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⠟⠁⠈⠋⣻⣿⣶⣄⠀⠀⠀⢸⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⡢⠛⠿⢿⣿⡄⠀⠄⣸⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⣒⠀⠀⠀⠀⠀⠀⠈⠃⠈⠍⢻⡏⠀⢰⣟⡇⠂⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠰⣿⡻⡾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⠛⠿⡧⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢿⠀⢠⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡄⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⢸⠀⠀⠙⢿⣇⠀⠀⠀⠀⠲⢤⣴⠆⡀⠀⠀⠀⢸⡀⠀⠀⠀⠁⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠩⠿⠀⠀⣠⡀⠀⢇⢠⣤⡠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠉⠀⠸⣆⡻⡇⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⡎⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣧⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⢡⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠈⠿⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢸⣽⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢤⣀⠉⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢃⣾⡯⠀⠀⠐⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠃⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⢿⣿⣿⣿⣿⣿⠿⠿⠛⠛⠉⠉⠉⠁⠀⠀⠀⠀⠀⠉⠉⣀⣾⣿⣏⡄⠀⠀⢰⣷⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⡿⠋⠀⠀⣸⡿⢱⠛⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣹⡿⠹⡏⣰⣎⠀⠀⣽⡇⡤⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣹⠁⣾⢴⣿⡋⠀⢀⣾⣿⡟⠆⠀⠀⠀⠀⠀⢠⣶⣦⣤⣄⣄⣀⣀⣀⠺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠁⣼⢿⡀⢿⡁⠀⢀⣿⠟⠀⠀⢀⡀⢁⣶⣿⣿⣿⣿⣿⣿⡿⠙⢽⣿⣿⣦⣝⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢯⣽⡇⣾⡇⠀⢸⡟⠀⠀⠀⣼⣿⣿⠟⢻⣿⣿⣿⣿⣿⠇⠀⠈⠁⠉⠻⣿⣷⣬⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⢠⢹⡿⠀⠀⠀⠀⠀⠀⠈⠛⠃⠀⠰⣶⣿⣿⣿⡟⠀⠀⠀⠀⠀⠁⠘⢿⣿⣿⣮⡻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢻⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠟⠛⣻⠏⠀⠀⠀⠀⠀⠀⠀⠘⠀⠡⣽⣿⣷⡜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣼⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠟⠁⠀⣸⣿⡀⠀⠀⠀⠀⣠⡄⠀⠀⠀⠀⢀⣻⣿⣿⣎⠻⣿⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⣠⣤⢤⣤⣴⣾⣿⣯⣥⣤⣶⣶⠟⠻⠛⠉⣸⣿⣾⣿⣿⣿⣮⡻⣷⡙⣿⣿⣿⣿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠚⡿⠿⠟⠛⠻⠟⢻⣏⣩⣿⣿⡇⠀⠀⠀⠊⢘⣛⠻⣿⣿⣿⣿⣷⣾⣿⣮⣛⠻⢿⣿⣿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡀⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣿⠃⠸⠍⠫⢿⠿⣿⣿⣮⣽⣿⣿⣿⣿⣿⣿⣿⣿⣦⡙⢿⣿<br />⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠻⢿⡟⠀⠀⠀⠠⣎⠀⣸⡿⢿⣿⢿⠟⣛⣿⣟⣿⣿⣿⣿⣿⣦⣙',
};

export const executeCommand = (
    command: string, 
    args: string[], 
    currentFolder: string[], 
    setCurrentFolder: React.Dispatch<React.SetStateAction<string[]>>,
    changeThemeColor: (theme: string) => void
  ): string => {
    if (commands[command]) {
      return commands[command](args, currentFolder, setCurrentFolder, changeThemeColor);
    } else {
      return `Command not found: ${command}. Type 'help' for a list of available commands.`;
    }
  };