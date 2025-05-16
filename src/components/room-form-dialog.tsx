
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Room, Group } from "@/lib/types";
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
  FormDescription as FormDesc, 
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

const roomFormValuesSchema = z.object({
  name: z.string().min(1, { message: "Название кабинета обязательно." }),
  rows: z.coerce.number().min(1, { message: "Количество рядов должно быть не менее 1." }).max(10, { message: "Количество рядов не может превышать 10." }),
  cols: z.coerce.number().min(1, { message: "Количество колонок должно быть не менее 1." }).max(10, { message: "Количество колонок не может превышать 10." }),
  corridorsAfterRowsInput: z.string().optional().default(""),
  corridorsAfterColsInput: z.string().optional().default(""),
  activeGroupIds: z.array(z.string()).optional().default([]),
});

type RoomFormValues = z.infer<typeof roomFormValuesSchema>;

export type RoomSubmitData = Omit<RoomFormValues, 'corridorsAfterRowsInput' | 'corridorsAfterColsInput'> & {
  corridorsAfterRows?: number[];
  corridorsAfterCols?: number[];
};

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoomSubmitData, roomId?: string) => void; 
  initialData?: Room;
  allGroups: Group[];
}

const formatCorridorsToString = (corridors?: number[]): string => {
  return corridors && corridors.length > 0 ? corridors.join(", ") : "";
};

export function RoomFormDialog({ open, onOpenChange, onSubmit, initialData, allGroups }: RoomFormDialogProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormValuesSchema),
    defaultValues: initialData 
      ? { 
          name: initialData.name,
          rows: initialData.rows,
          cols: initialData.cols,
          corridorsAfterRowsInput: formatCorridorsToString(initialData.corridorsAfterRows),
          corridorsAfterColsInput: formatCorridorsToString(initialData.corridorsAfterCols),
          activeGroupIds: initialData.activeGroupIds || [],
        } 
      : { name: "", rows: 5, cols: 6, corridorsAfterRowsInput: "", corridorsAfterColsInput: "", activeGroupIds: [] },
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
          activeGroupIds: initialData.activeGroupIds || [],
        });
      } else {
        form.reset({ name: "", rows: 5, cols: 6, corridorsAfterRowsInput: "", corridorsAfterColsInput: "", activeGroupIds: [] });
      }
    }
  }, [initialData, form, open]);

  const handleSubmit = (data: RoomFormValues) => {
    const parseCorridorString = (input: string | undefined, maxDimension: number): number[] => {
      if (!input) return [];
      return input.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0 && n < maxDimension) 
        .sort((a,b) => a-b); 
    };
    
    const submitData: RoomSubmitData = {
        name: data.name,
        rows: data.rows,
        cols: data.cols,
        corridorsAfterRows: parseCorridorString(data.corridorsAfterRowsInput, data.rows),
        corridorsAfterCols: parseCorridorString(data.corridorsAfterColsInput, data.cols),
        activeGroupIds: data.activeGroupIds || [],
    };
    onSubmit(submitData, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать кабинет" : "Добавить новый кабинет"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Обновите данные и схему кабинета." : "Введите название, размеры, расположение коридоров и активные группы."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название кабинета</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Кабинет химии, Кабинет 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество рядов столов</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="например, 5" {...field} />
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
                    <FormLabel>Количество колонок столов</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="например, 6" {...field} />
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
                  <FormLabel>Коридоры после рядов</FormLabel>
                  <FormControl>
                    <Input placeholder="например, 2, 4 (1-индексированные)" {...field} />
                  </FormControl>
                  <FormDesc>Номера рядов через запятую, после которых должен появиться коридор. (Макс: {form.watch("rows") - 1 || 'Н/Д'})</FormDesc>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="corridorsAfterColsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Коридоры после колонок</FormLabel>
                  <FormControl>
                    <Input placeholder="например, 1, 3 (1-индексированные)" {...field} />
                  </FormControl>
                   <FormDesc>Номера колонок через запятую, после которых должен появиться коридор. (Макс: {form.watch("cols") - 1 || 'Н/Д'})</FormDesc>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="activeGroupIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Активные группы в кабинете</FormLabel>
                    <FormDesc>Выберите группы, которые преимущественно занимаются в этом кабинете.</FormDesc>
                    <ScrollArea className="h-[100px] border rounded-md p-2 mt-1">
                    {allGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Нет доступных групп.</p>}
                    {allGroups.map((group) => (
                      <FormField
                        key={group.id}
                        control={form.control}
                        name="activeGroupIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={group.id}
                              className="flex flex-row items-center space-x-3 space-y-0 py-1"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(group.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), group.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== group.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {group.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button type="submit">{initialData ? "Сохранить изменения" : "Добавить кабинет"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
