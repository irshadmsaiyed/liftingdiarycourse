import { Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWorkoutsForDate } from "@/data/workouts";
import DatePicker from "./DatePicker";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam
    ? new Date(dateParam + "T00:00:00")
    : new Date();

  const workoutsData = await getWorkoutsForDate(date);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workout Log</h1>
        <DatePicker selectedDate={date} />
      </div>

      <div className="space-y-4">
        {workoutsData.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Dumbbell className="h-8 w-8" />
              <p>No workouts logged for this date.</p>
            </CardContent>
          </Card>
        ) : (
          workoutsData.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{workout.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workout.workoutExercises.map((we) => {
                  const setCount = we.sets.length;
                  const firstSet = we.sets[0];
                  return (
                    <div
                      key={we.id}
                      className="flex items-center justify-between py-1.5 border-b last:border-0"
                    >
                      <span className="text-sm font-medium">{we.exercise.name}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {setCount} {setCount === 1 ? "set" : "sets"}
                        </Badge>
                        {firstSet && (
                          <>
                            <Badge variant="secondary">{firstSet.reps} reps</Badge>
                            {firstSet.weight && (
                              <Badge variant="outline">{firstSet.weight}kg</Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
