import {Slot, Redirect} from 'expo-router'
import { useAuth } from '@/context/AuthContext'
/* 
If a user tries to access a protected page without being logged in, they are redirected to the sign-in page.
If there is no session (!session is true), the user is redirected to the /signin page.

If there is a session (!session is false), the <Slot/> component is rendered, allowing the user to access the protected content.
If the user is logged in, they can access the content rendered by <Slot/>.
*/
export default function AppLayout(){
    const {session} = useAuth()
    return !session ? <Redirect  href="/signin"/> : <Slot/>
}