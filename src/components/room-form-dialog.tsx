
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const roomFormSchema = z.object({
  name: z.string().min(1, { message: "Room name is required." }),
  rows: z.coerce.number().min(1, { message: "Rows must be at least 1." }).max(10, { message: "Rows cannot exceed 10." }),
  cols: z.coerce.number().min(1, { message: "Columns must be at least 1." }).max(10, { message: "Columns cannot exceed 10." }),
  rowGap: z.coerce.number().min(0, "Gap must be 0 or more.").max(3, "Gap cannot exceed 3.").optional().default(0),
  colGap: z.coerce.number().min(0, "Gap must be 0 or more.").max(3, "Gap cannot exceed 3.").optional().default(0),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoomFormValues, roomId?: string) => void;
  initialData?: Room;
}

export function RoomFormDialog({ open, onOpenChange, onSubmit, initialData }: RoomFormDialogProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: initialData 
      ? { ...initialData, rowGap: initialData.rowGap ?? 0, colGap: initialData.colGap ?? 0 } 
      : { name: "", rows: 5, cols: 6, rowGap: 0, colGap: 0 },
  });

 useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({ ...initialData, rowGap: initialData.rowGap ?? 0, colGap: initialData.colGap ?? 0 });
      } else {
        form.reset({ name: "", rows: 5, cols: 6, rowGap: 0, colGap: 0 });
      }
    }
  }, [initialData, form, open]);

  const handleSubmit = (data: RoomFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the room's details and layout." : "Enter the name, dimensions, and corridor gaps for the new room."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Science Lab, Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Rows</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cols"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Columns</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rowGap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Row Gap (Corridors)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 0 or 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colGap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Column Gap (Corridors)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 0 or 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{initialData ? "Save Changes" : "Add Room"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

