import UIKit
import Capacitor

/// Registers app-local plugins with the Capacitor bridge. This is the supported
/// path for plugins that live in the app target rather than an npm package —
/// `packageClassList` in capacitor.config.json can't be used because `cap sync`
/// regenerates it from installed npm plugins and wipes hand-added entries.
class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(HealthPlugin())
    }
}
