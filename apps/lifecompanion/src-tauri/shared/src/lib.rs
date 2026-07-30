// Commands
pub mod commands;

#[macro_export]
macro_rules! init_tauri_app {
    ($builder:expr, [ $($local_handlers:path),* $(,)? ]) => {
        $builder
            // Shared plugins
            .plugin(tauri_plugin_opener::init())

            // Shared commands
            .invoke_handler(tauri::generate_handler![
                $crate::commands::greet,
                $($local_handlers),*
            ])
    };
}
