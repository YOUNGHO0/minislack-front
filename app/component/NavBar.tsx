

import { QuestionMarkCircleIcon , AcademicCapIcon } from '@heroicons/react/24/outline';
import MainButton from "@/app/component/MainButton";
import QuestionButton from "@/app/component/QuestionButton";
import Setting from "@/app/component/SettingButton";
import SettingButton from "@/app/component/SettingButton";


interface PageProps {
    params: { spaceId: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}


export default function NavBar(){

    return(


        <nav
            className="relative flex lg:flex-col items-center justify-between
             lg:p-3 bg-neutral-200  lg:order-first p-1">
            <div className={"flex w-100 lg:w-10 lg:h-80  h-10 flex-row lg:flex-col items-center justify-evenly "}>
                <MainButton></MainButton>
                <QuestionButton></QuestionButton>
                <SettingButton></SettingButton>
            </div>

            <div className="lg:w-8 lg:h-1/5 w-1/5 items-center flex justify-center">
                <AcademicCapIcon className="w-8"/>
            </div>

        </nav>
    );


}