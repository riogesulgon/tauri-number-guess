use rand::Rng;

#[derive(Clone, serde::Serialize)]
pub struct GameState {
    target_number: u32,
    attempts: u32,
}

impl GameState {
    pub fn new() -> Self {
        let target_number = rand::thread_rng().gen_range(1..=100);
        GameState {
            target_number,
            attempts: 0,
        }
    }

    pub fn guess(&mut self, guess: u32) -> (String, u32) {
        self.attempts += 1;
        let result = match guess.cmp(&self.target_number) {
            std::cmp::Ordering::Less => format!("Too low! Attempt {}", self.attempts),
            std::cmp::Ordering::Greater => format!("Too high! Attempt {}", self.attempts),
            std::cmp::Ordering::Equal => format!("Congratulations! You guessed the number in {} attempts!", self.attempts),
        };
        (result, self.attempts)
    }
}
