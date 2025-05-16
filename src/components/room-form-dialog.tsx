
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
  FormDescription as FormDesc, // Renamed to avoid conflict
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

// Schema for form values, corridors are strings here
const roomFormValuesSchema = z.object({
  name: z.string().min(1, { message: "Room name is required." }),
  rows: z.coerce.number().min(1, { message: "Rows must be at least 1." }).max(10, { message: "Rows cannot exceed 10." }),
  cols: z.coerce.number().min(1, { message: "Columns must be at least 1." }).max(10, { message: "Columns cannot exceed 10." }),
  corridorsAfterRowsInput: z.string().optional().default(""),
  corridorsAfterColsInput: z.string().optional().default(""),
});

// This type is for the form's data directly
type RoomFormValues = z.infer<typeof roomFormValuesSchema>;

// This type is for the onSubmit handler, after parsing strings to number[]
export type RoomSubmitData = Omit<RoomFormValues, 'corridorsAfterRowsInput' | 'corridorsAfterColsInput'> & {
  corridorsAfterRows?: number[];
  corridorsAfterCols?: number[];
};

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoomSubmitData, roomId?: string) => void; // Expects parsed data
  initialData?: Room; // Room type has number[] for corridors
}

// Helper to convert array of numbers to comma-separated string
const formatCorridorsToString = (corridors?: number[]): string => {
  return corridors && corridors.length > 0 ? corridors.join(", ") : "";
};

export function RoomFormDialog({ open, onOpenChange, onSubmit, initialData }: RoomFormDialogProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormValuesSchema),
    defaultValues: initialData 
      ? { 
          name: initialData.name,
          rows: initialData.rows,
          cols: initialData.cols,
          corridorsAfterRowsInput: formatCorridorsToString(initialData.corridorsAfterRows),
          corridorsAfterColsInput: formatCorridorsToString(initialData.corridorsAfterCols),
        } 
      : { name: "", rows: 5, cols: 6, corridorsAfterRowsInput: "", corridorsAfterColsInput: "" },
  });

 useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          rows: initialData.rows,
          cols: initialData.cols,
          corridorsAfterRowsInput: formatCorridorsToString(initialData.corridorsAfterRows),
          corridorsAfterColsInput: formatCorridorsToString(initialData.corridorsAfterCols),
        });
      } else {
        form.reset({ name: "", rows: 5, cols: 6, corridorsAfterRowsInput: "", corridorsAfterColsInput: "" });
      }
    }
  }, [initialData, form, open]);

  const handleSubmit = (data: RoomFormValues) => {
    // Parsing logic is now expected to be handled by the parent (page.tsx)
    // For now, we assume onSubmit can handle RoomFormValues or we adjust its signature
    // For this iteration, we will pass the string values and let page.tsx parse them.
    // However, the prompt implies the dialog's onSubmit passes the final structure.
    // So, let's do the parsing here and define a submit type.

    const parseCorridorString = (input: string | undefined, maxDimension: number): number[] => {
      if (!input) return [];
      return input.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0 && n < maxDimension) // Valid corridor if n < max (e.g. for 5 rows, after 1,2,3,4)
        .sort((a,b) => a-b); // Sort for consistency
    };
    
    const submitData: RoomSubmitData = {
        name: data.name,
        rows: data.rows,
        cols: data.cols,
        corridorsAfterRows: parseCorridorString(data.corridorsAfterRowsInput, data.rows),
        corridorsAfterCols: parseCorridorString(data.corridorsAfterColsInput, data.cols),
    };
    onSubmit(submitData, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the room's details and layout." : "Enter the name, dimensions, and specific corridor placements."}
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
                    <FormLabel>Number of Desk Rows</FormLabel>
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
                    <FormLabel>Number of Desk Columns</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="corridorsAfterRowsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corridors After Rows</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2, 4 (1-indexed)" {...field} />
                  </FormControl>
                  <FormDesc>Comma-separated row numbers after which a corridor should appear. (Max: {form.getValues().rows - 1 || 'N/A'})</FormDesc>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="corridorsAfterColsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corridors After Columns</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1, 3 (1-indexed)" {...field} />
                  </FormControl>
                   <FormDesc>Comma-separated column numbers after which a corridor should appear. (Max: {form.getValues().cols - 1 || 'N/A'})</FormDesc>
                  <FormMessage />
                </FormItem>
              )}
            />
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
