// Chess Board Theme System

export interface BoardTheme {
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightLight?: string;
  highlightDark?: string;
}

export const boardThemes: { [key: string]: BoardTheme } = {
  classic: {
    name: 'Classic Grey',
    lightSquare: '#e8e8e8',
    darkSquare: '#6c757d',
    highlightLight: '#f6f669',
    highlightDark: '#baca44'
  },
  wood: {
    name: 'Wooden',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlightLight: '#cdd26a',
    highlightDark: '#aaa23a'
  },
  blue: {
    name: 'Ocean Blue',
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    highlightLight: '#7fb0d3',
    highlightDark: '#5d8ba8'
  },
  green: {
    name: 'Forest Green',
    lightSquare: '#ffffdd',
    darkSquare: '#86a666',
    highlightLight: '#cdd16a',
    highlightDark: '#aaac39'
  },
  purple: {
    name: 'Royal Purple',
    lightSquare: '#e8d5f0',
    darkSquare: '#9370db',
    highlightLight: '#b896d4',
    highlightDark: '#8a5dbf'
  },
  brown: {
    name: 'Coffee Brown',
    lightSquare: '#f5deb3',
    darkSquare: '#8b4513',
    highlightLight: '#d4af37',
    highlightDark: '#b8860b'
  },
  marble: {
    name: 'Marble',
    lightSquare: '#f5f5dc',
    darkSquare: '#778899',
    highlightLight: '#e6d8a3',
    highlightDark: '#5f6e7d'
  },
  neon: {
    name: 'Neon',
    lightSquare: '#1a1a2e',
    darkSquare: '#0f3460',
    highlightLight: '#e94560',
    highlightDark: '#16213e'
  },
  tournament: {
    name: 'Tournament',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlightLight: '#f7ec6c',
    highlightDark: '#d0b348'
  },
  pink: {
    name: 'Cherry Blossom',
    lightSquare: '#ffc0cb',
    darkSquare: '#ff69b4',
    highlightLight: '#ffb6c1',
    highlightDark: '#ff1493'
  }
};

class ThemeService {
  private currentTheme: string = 'classic';
  
  getCurrentTheme(): BoardTheme {
    return boardThemes[this.currentTheme];
  }
  
  setTheme(themeName: string) {
    if (boardThemes[themeName]) {
      this.currentTheme = themeName;
      localStorage.setItem('chessTheme', themeName);
    }
  }
  
  getThemeName(): string {
    return this.currentTheme;
  }
  
  loadSavedTheme() {
    const saved = localStorage.getItem('chessTheme');
    if (saved && boardThemes[saved]) {
      this.currentTheme = saved;
    }
  }
  
  getAllThemes(): { [key: string]: BoardTheme } {
    return boardThemes;
  }
}

export const themeService = new ThemeService();
