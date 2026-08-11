import Foundation
import Capacitor
import HealthKit

/// Minimal HealthKit bridge: today's step count, straight from the phone's
/// sensor data. Read-only — the app never writes to Health.
@objc(HealthPlugin)
public class HealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthPlugin"
    public let jsName = "Health"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTodaySteps", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(),
              let stepType = HKObjectType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Health data is not available on this device")
            return
        }
        store.requestAuthorization(toShare: nil, read: [stepType]) { granted, error in
            if let error = error {
                call.reject("Health authorization failed: \(error.localizedDescription)")
            } else {
                // Apple never reveals whether READ access was granted — a denied
                // read simply returns no samples later. `granted` here only means
                // the request flow completed.
                call.resolve(["completed": granted])
            }
        }
    }

    @objc func getTodaySteps(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(),
              let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Health data is not available on this device")
            return
        }

        let start = Calendar.current.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: .strictStartDate)

        // cumulativeSum deduplicates overlapping sources (phone + watch) the same
        // way the Health app itself does, so we never double-count.
        let query = HKStatisticsQuery(quantityType: stepType,
                                      quantitySamplePredicate: predicate,
                                      options: .cumulativeSum) { _, stats, error in
            if let error = error {
                call.reject("Step query failed: \(error.localizedDescription)")
                return
            }
            let steps = stats?.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
            call.resolve(["steps": Int(steps.rounded())])
        }
        store.execute(query)
    }
}
