"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";
import { updateWorkoutAction } from "./actions";

type Props = {
  workoutId: number;
  initialName: string | null;
  initialStartedAt: Date;
};

export default function EditWorkoutForm({ workoutId, initialName, initialStartedAt }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [date, setDate] = useState<Date>(initialStartedAt);
  const [calOpen, setCalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateWorkoutAction({
        workoutId,
        name: name.trim() || undefined,
        startedAt: date,
      });
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formatDate(date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setCalOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
