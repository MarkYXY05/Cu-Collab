// constants/Navigation.ts
import Goal from "../pages/Goal";
import Message from "../pages/Message";
import Progress from "../pages/Progress";
import CheckIn from "../pages/Check-In";
import Events from "../pages/Events";
import HomePage from "../pages/Home";


/**
 * Most of the time, the name of your app is the name of the folder you're in
 * right now, and the name of your Git repository.
 * For instance, if that name is "my-app", then you should set this to:
 * "https://my-app.fly.dev/api"
 *
 * If you've already deployed your app (using `fly launch` or `fly deploy`),
 * you can find the name by running `flyctl status`, under App > Name.
 */
export const BACKEND_BASE_PATH = 'https://fa23-lec9-demo-soln.fly.dev/api';

export const PATHS: {
    link: string;
    label: string;
    element?: JSX.Element;
}[] = [
    {
        link: "/",
        label: "Home",
        element: <HomePage />,
    },
    {
        link: "/message",
        label: "Message",
        element: <Message />,
    },
    {
        link: "/goal",
        label: "Goal",
        element: <Goal />,
    },
    {
        link: "/progress",
        label: "Progress",
        element: <Progress />
    },
    {
        link: "/check-in",
        label: "Check-In",
        element: <CheckIn />,
    },
    {
        link: "/events",
        label: "Events",
        element: <Events />,
    }
];
