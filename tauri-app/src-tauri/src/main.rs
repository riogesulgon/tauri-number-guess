// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_app_lib::GameState;

#[tauri::command]
fn start_game() -> GameState {
    GameState::new()
}

#[tauri::command]
fn make_guess(state: tauri::State<'_, GameState>, guess: u32) -> (String, u32) {
    let mut game_state = state.inner().clone();
    let result = game_state.guess(guess);
    result
}

fn main() {
    tauri::Builder::default()
        .manage(GameState::new())
        .invoke_handler(tauri::generate_handler![
            start_game,
            make_guess
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
