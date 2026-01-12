import WidgetKit
import SwiftUI
import UIKit

// MARK: - Data Models

struct WidgetHabit: Codable, Identifiable {
    let id: String
    let name: String
    let emoji: String?
    let timeOfDay: String
    let isComplete: Bool
    let progress: Int?
    let goal: Int?
}

struct WidgetData: Codable {
    let habits: [WidgetHabit]
    let completedCount: Int
    let totalCount: Int
    let streak: Int
    let lastUpdated: String
}

// MARK: - Data Provider

struct HabitDataProvider {
    static let appGroup = "group.com.leo.shared"
    static let dataKey = "widget_habits_today"
    
    static func loadData() -> WidgetData? {
        guard let userDefaults = UserDefaults(suiteName: appGroup),
              let jsonString = userDefaults.string(forKey: dataKey),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }
        
        do {
            return try JSONDecoder().decode(WidgetData.self, from: jsonData)
        } catch {
            print("Widget: Failed to decode data: \(error)")
            return nil
        }
    }
    
    static var placeholder: WidgetData {
        WidgetData(
            habits: [
                WidgetHabit(id: "1", name: "Morning Meditation", emoji: "🧘", timeOfDay: "morning", isComplete: true, progress: nil, goal: nil),
                WidgetHabit(id: "2", name: "Drink Water", emoji: "💧", timeOfDay: "morning", isComplete: false, progress: 4, goal: 8),
                WidgetHabit(id: "3", name: "Exercise", emoji: "🏃", timeOfDay: "afternoon", isComplete: false, progress: nil, goal: nil),
            ],
            completedCount: 1,
            totalCount: 3,
            streak: 5,
            lastUpdated: ""
        )
    }
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> HabitEntry {
        HabitEntry(date: Date(), data: HabitDataProvider.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitEntry) -> ()) {
        let data = HabitDataProvider.loadData() ?? HabitDataProvider.placeholder
        let entry = HabitEntry(date: Date(), data: data)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let data = HabitDataProvider.loadData() ?? HabitDataProvider.placeholder
        let entry = HabitEntry(date: Date(), data: data)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct HabitEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}
// MARK: - Widget Views

struct SmallWidgetView: View {
    let entry: HabitEntry

    var progressPercentage: Double {
        guard entry.data.totalCount > 0 else { return 0 }
        return Double(entry.data.completedCount) / Double(entry.data.totalCount)
    }

    var isAllDone: Bool {
        entry.data.completedCount >= entry.data.totalCount && entry.data.totalCount > 0
    }

    var motivationalText: String {
        if isAllDone {
            return "All done!"
        } else if entry.data.completedCount == 0 {
            return "Let's go!"
        } else {
            return "Keep it up!"
        }
    }

    var percentageComplete: Int {
        guard entry.data.totalCount > 0 else { return 0 }
        return Int((Double(entry.data.completedCount) / Double(entry.data.totalCount)) * 100)
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Content
                VStack(spacing: 0) {
                    // Top row: Today + Streak
                    HStack {
                        Text("Today")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.secondary)
                        Spacer()
                        HStack(spacing: 2) {
                            Text("🔥")
                                .font(.system(size: 10))
                            Text("\(entry.data.streak)")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.orange)
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                    // Middle section: Text left, Ring right
                    HStack(alignment: .center, spacing: 8) {
                        // Left: Count text
                        VStack(alignment: .leading, spacing: 1) {
                            Text("\(entry.data.completedCount)/\(entry.data.totalCount)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.primary)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                            Text("done")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        // Right: Circular progress
                        ZStack {
                            Circle()
                                .stroke(Color.orange.opacity(0.2), lineWidth: 4)
                            Circle()
                                .trim(from: 0, to: progressPercentage)
                                .stroke(Color.orange, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                                .rotationEffect(.degrees(-90))

                            Text("\(percentageComplete)%")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.orange)
                        }
                        .frame(width: 44, height: 44)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 6)

                    Spacer()
                }

                // Big cat at bottom center
                VStack {
                    Spacer()
                    Image("CatMascotPeeking")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: geometry.size.width * 0.65)
                        .offset(y: geometry.size.height * 0.20)
                }
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct MediumWidgetView: View {
    let entry: HabitEntry

    var progressPercentage: Double {
        guard entry.data.totalCount > 0 else { return 0 }
        return Double(entry.data.completedCount) / Double(entry.data.totalCount)
    }

    var morningCount: Int {
        entry.data.habits.filter { $0.timeOfDay == "morning" }.count
    }

    var afternoonCount: Int {
        entry.data.habits.filter { $0.timeOfDay == "afternoon" }.count
    }

    var eveningCount: Int {
        entry.data.habits.filter { $0.timeOfDay == "evening" }.count
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Big tilted cat on the left
                VStack {
                    Spacer()
                    HStack {
                        Image("CatMascotPeeking")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: geometry.size.width * 0.55)
                            .rotationEffect(.degrees(-12), anchor: .bottomTrailing)
                            .offset(x: -geometry.size.width * 0.12, y: geometry.size.height * 0.12)
                        Spacer()
                    }
                }

                // Top right: Progress ring with flame
                VStack {
                    HStack {
                        Spacer()

                        HStack(spacing: 10) {
                            // Progress ring with flame
                            ZStack {
                                Circle()
                                    .stroke(Color.orange.opacity(0.2), lineWidth: 4)
                                Circle()
                                    .trim(from: 0, to: progressPercentage)
                                    .stroke(Color.orange, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                                    .rotationEffect(.degrees(-90))

                                Text("🔥")
                                    .font(.system(size: 16))
                            }
                            .frame(width: 36, height: 36)

                            // Large count
                            VStack(alignment: .leading, spacing: 0) {
                                Text("\(entry.data.completedCount)/\(entry.data.totalCount)")
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.primary)
                                Text("done")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.trailing, 14)
                        .padding(.top, 8)
                    }
                    Spacer()
                }

                // Bottom right: Floating card with time-of-day breakdown
                VStack {
                    Spacer()
                        .frame(minHeight: 60)
                    HStack {
                        Spacer()

                        // Floating card
                        VStack(alignment: .leading, spacing: 5) {
                            HStack(spacing: 5) {
                                Text("☀️")
                                    .font(.system(size: 11))
                                Text("Morning")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(morningCount)")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.primary)
                            }

                            HStack(spacing: 5) {
                                Text("🌤️")
                                    .font(.system(size: 11))
                                Text("Afternoon")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(afternoonCount)")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.primary)
                            }

                            HStack(spacing: 5) {
                                Text("🌙")
                                    .font(.system(size: 11))
                                Text("Evening")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(eveningCount)")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.primary)
                            }
                        }
                        .padding(8)
                        .frame(width: 110)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemBackground).opacity(0.9))
                                .shadow(color: .black.opacity(0.08), radius: 4, x: 0, y: 2)
                        )
                        .padding(.trailing, 12)
                        .padding(.bottom, 6)
                    }
                }

                // Streak badge top left
                VStack {
                    HStack {
                        HStack(spacing: 3) {
                            Text("🔥")
                                .font(.system(size: 11))
                            Text("\(entry.data.streak) day streak")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(Color.orange.opacity(0.15))
                        )
                        .padding(.leading, 12)
                        .padding(.top, 12)

                        Spacer()
                    }
                    Spacer()
                }
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct HabitRow: View {
    let habit: WidgetHabit
    
    var body: some View {
        HStack(spacing: 8) {
            // Checkbox
            ZStack {
                Circle()
                    .stroke(habit.isComplete ? Color.orange : Color.gray.opacity(0.3), lineWidth: 1.5)
                    .frame(width: 18, height: 18)
                
                if habit.isComplete {
                    Circle()
                        .fill(Color.orange)
                        .frame(width: 12, height: 12)
                }
            }
            
            // Emoji
            Text(habit.emoji ?? "📌")
                .font(.system(size: 14))
            
            // Name
            Text(habit.name)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(habit.isComplete ? .secondary : .primary)
                .strikethrough(habit.isComplete)
                .lineLimit(1)
        }
    }
}

struct LargeWidgetView: View {
    let entry: HabitEntry

    var progressPercentage: Double {
        guard entry.data.totalCount > 0 else { return 0 }
        return Double(entry.data.completedCount) / Double(entry.data.totalCount)
    }

    var percentageComplete: Int {
        guard entry.data.totalCount > 0 else { return 0 }
        return Int((Double(entry.data.completedCount) / Double(entry.data.totalCount)) * 100)
    }

    var morningHabits: [WidgetHabit] {
        entry.data.habits.filter { $0.timeOfDay == "morning" }
    }

    var afternoonHabits: [WidgetHabit] {
        entry.data.habits.filter { $0.timeOfDay == "afternoon" }
    }

    var eveningHabits: [WidgetHabit] {
        entry.data.habits.filter { $0.timeOfDay == "evening" }
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Main content
                VStack(spacing: 0) {
                    // Header: Title + Streak + Stats
                    VStack(spacing: 8) {
                        HStack {
                            Text("Today's Habits")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.primary)

                            Spacer()

                            HStack(spacing: 3) {
                                Text("🔥")
                                    .font(.system(size: 12))
                                Text("\(entry.data.streak)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.orange)
                            }
                        }

                        // Progress bar row
                        HStack(spacing: 10) {
                            Text("\(entry.data.completedCount)/\(entry.data.totalCount) done")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.secondary)

                            GeometryReader { barGeo in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color.orange.opacity(0.2))
                                        .frame(height: 8)

                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(Color.orange)
                                        .frame(width: max(8, barGeo.size.width * progressPercentage), height: 8)
                                }
                            }
                            .frame(height: 8)

                            Text("\(percentageComplete)%")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.orange)
                                .frame(width: 36, alignment: .trailing)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 14)
                    .padding(.bottom, 10)

                    Divider()
                        .padding(.horizontal, 16)

                    // Two-column habits grid
                    HStack(alignment: .top, spacing: 12) {
                        // Left column: Morning + Evening
                        VStack(alignment: .leading, spacing: 12) {
                            if !morningHabits.isEmpty {
                                LargeHabitSection(title: "Morning", emoji: "☀️", habits: Array(morningHabits.prefix(3)))
                            }
                            if !eveningHabits.isEmpty {
                                LargeHabitSection(title: "Evening", emoji: "🌙", habits: Array(eveningHabits.prefix(3)))
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        // Right column: Afternoon
                        VStack(alignment: .leading, spacing: 12) {
                            if !afternoonHabits.isEmpty {
                                LargeHabitSection(title: "Afternoon", emoji: "🌤️", habits: Array(afternoonHabits.prefix(3)))
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)

                    Spacer()
                }

                // Big cat at bottom center
                VStack {
                    Spacer()
                    Image("CatMascotPeeking")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: geometry.size.width * 0.5)
                        .offset(y: geometry.size.height * 0.1)
                }
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct LargeHabitSection: View {
    let title: String
    let emoji: String
    let habits: [WidgetHabit]

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 4) {
                Text(emoji)
                    .font(.system(size: 12))
                Text(title)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
            }

            ForEach(habits) { habit in
                HStack(spacing: 6) {
                    Image(systemName: habit.isComplete ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 13))
                        .foregroundColor(habit.isComplete ? .orange : .gray.opacity(0.4))

                    Text(habit.name)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(habit.isComplete ? .secondary : .primary)
                        .strikethrough(habit.isComplete)
                        .lineLimit(1)
                }
            }
        }
    }
}

struct HabitSection: View {
    let title: String
    let emoji: String
    let habits: [WidgetHabit]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 4) {
                Text(emoji)
                    .font(.system(size: 12))
                Text(title)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            
            ForEach(habits) { habit in
                HabitRow(habit: habit)
            }
        }
    }
}

// MARK: - Widget Configuration

struct LeoWidget: Widget {
    let kind: String = "LeoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            LeoWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Leo Habits")
        .description("Track your daily habits at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct LeoWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: HabitEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    LeoWidget()
} timeline: {
    HabitEntry(date: .now, data: HabitDataProvider.placeholder)
}

#Preview(as: .systemMedium) {
    LeoWidget()
} timeline: {
    HabitEntry(date: .now, data: HabitDataProvider.placeholder)
}

#Preview(as: .systemLarge) {
    LeoWidget()
} timeline: {
    HabitEntry(date: .now, data: HabitDataProvider.placeholder)
}

