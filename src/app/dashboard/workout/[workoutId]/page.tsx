import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

type PageProps = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const workout = await getWorkoutById(id);

  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm
            workoutId={workout.id}
            initialName={workout.name ?? null}
            initialStartedAt={workout.startedAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
