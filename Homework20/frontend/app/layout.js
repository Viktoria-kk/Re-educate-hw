import "./globals.css"; import { UserProvider } from "@/context/UserContext"; import Navbar from "@/components/Navbar";
export const metadata = { title: "QuizBoard", description: "Real-time quizzes and live rankings" };
export default function RootLayout({ children }) { return <html lang="en"><body><UserProvider><Navbar /><main className="page-shell">{children}</main><footer>QuizBoard · Real-time quizzes and rankings.</footer></UserProvider></body></html>; }
