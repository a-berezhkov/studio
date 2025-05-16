
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function AdminUsersPage() {
  // This page is a placeholder for user management.
  // Admin authentication and user management logic can be added here.

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Управление пользователями</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в класс
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Управление пользователями приложения</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Этот раздел предоставит инструменты для управления пользователями, их ролями и правами в приложении Навигатор по классу.
            </p>
            {/* Placeholder for user list, add user button, etc. */}
            <div className="mt-6 p-6 border-2 border-dashed border-muted-foreground/30 rounded-md text-center">
              <p className="text-muted-foreground">Интерфейс управления пользователями будет реализован здесь.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Навигатор по классу. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
