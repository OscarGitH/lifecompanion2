#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    // .plugin(tauri_plugin_fs::init()); Local plugins implementation

    lifecompanion_shared_lib::init_tauri_app!(
        builder,
        [ /* local_command, : Local commands implementation (comma separated) */ ]
    )
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
