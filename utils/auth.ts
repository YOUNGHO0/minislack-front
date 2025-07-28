import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import axios, {AxiosResponse} from "axios";

export function checkUserAuth(router: AppRouterInstance, pathname: string) {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user`, {
        withCredentials: true,
        headers: {"Content-Type": "application/json"}
    })
        .then((response: AxiosResponse) => {
            if (response.status !== 200) router.push(`${process.env.NEXT_PUBLIC_WEB_URL}/login`)
        })
        .catch(() => {

            router.push(`${process.env.NEXT_PUBLIC_WEB_URL}/login?redirect=${pathname}`)
        })
}

