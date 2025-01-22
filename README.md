# Tauri Number Guessing Game Tutorial

This project demonstrates how to build a desktop number guessing game using:
- **Tauri** for desktop application framework
- **Rust** for game logic and backend
- **React** for the user interface

## Game Overview

The number guessing game is a simple yet effective way to learn Tauri development. The game features:
- Random number generation in Rust
- User input validation
- Guess tracking and feedback
- Interactive React UI
- Secure frontend-backend communication

## Tutorial Structure

The tutorial is divided into several sections:

1. **Project Setup**
   - Initialize Tauri project
   - Configure development environment
   - Set up React frontend

2. **Game Logic Implementation**
   - Generate random number in Rust
   - Implement guess validation
   - Track game state

3. **User Interface Development**
   - Create React components
   - Implement game controls
   - Display game feedback

4. **Frontend-Backend Communication**
   - Set up Tauri commands
   - Handle user input
   - Update game state

5. **Building and Distribution**
   - Optimize application
   - Create platform-specific builds
   - Package for distribution

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Rust and Cargo
- System dependencies for Tauri

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tauri-number-guess.git
   cd tauri-number-guess
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run tauri dev
   ```

## Game Features

- Random number generation between 1-100
- Input validation and error handling
- Guess counter and history
- Win/lose conditions
- Responsive UI design

## Code Structure

```
tauri-number-guess/
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── src-tauri/           # Rust backend
│   ├── src/             # Game logic
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── public/              # Static assets
└── package.json         # Node.js dependencies
```

## Tutorial Content

The tutorial is available in the `tutorials/` directory:

1. [Introduction](./tutorials/00-introduction.md)
2. [Setup](./tutorials/01-setup.md)
3. [Project Structure](./tutorials/02-project-structure.md)
4. [Frontend Development](./tutorials/03-frontend.md)
5. [Backend Development](./tutorials/04-backend.md)
6. [IPC Communication](./tutorials/05-ipc.md)
7. [Building and Distribution](./tutorials/06-building.md)

## Running the Game

1. Start the development server:
   ```bash
   npm run tauri dev
   ```

2. The game window will open automatically

3. Enter your guess and click "Submit"

4. Receive feedback on your guess

5. Continue guessing until you find the correct number

## Building for Production

To create a production build:
```bash
npm run tauri build
```

This will create platform-specific binaries in `src-tauri/target/release/bundle/`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Tauri team for the excellent framework
- Rust community for the powerful language
- React team for the flexible UI library
