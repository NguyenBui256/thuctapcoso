import { useSearchParams } from "react-router-dom";

export const ERROR_TYPE = {
    INFOMATION_MISSING: 'Something is missing...',
    PRODUCT_NOT_EXIST: 'Product doesn\'t exist',
    UNKNOWN_ERROR: 'Something wrong, try again later!',
    NOT_FOUND: 'Trang không tồn tại!',
    UNAUTHORIZED: "Unauthorized"
}

export default function ErrorPage({ errorType = ERROR_TYPE.UNKNOWN_ERROR, errorMessage = null }) {
    const [params] = useSearchParams()
    const error = params.get('error')
    if (ERROR_TYPE[error]) errorType = ERROR_TYPE[error]

    // Display custom error message if provided, otherwise use the error type
    const displayMessage = errorMessage || errorType;

    return (
        <div className="relative">
            <img
                src="/bg.png"
                className="w-screen h-screen"
            >

            </img>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
                <h1 className="text-5xl font-bold text-red-500 mb-4">Oops!</h1>
                <p className="text-2xl text-white mb-6">
                    {displayMessage}
                </p>
                <a
                    href="/"
                    className="cursor-pointer p-2 rounded bg-teal-400 hover:bg-teal-500 text-white font-medium transition duration-200"
                >
                    Trở về trang chủ
                </a>
            </div>

        </div>
    );
}