import sendReponse from "./ResponseCtrl.js";
export const DoctorLogin = (req, res) => {
    const responseObject = {
            jwt: "your_jwt_token_here",
            expiresAt: 1678118400000, // Replace with the actual timestamp in milliseconds
            uid: "user_id_here",
            user: {
                _id: "user_id_here",
                username: "example_user",
                email: "user@example.com",
                name: "John Doe",
                displayPicture: "https://example.com/avatar.jpg"
            },
            message: "Login successful"
            };
    sendReponse(true, "Okay", responseObject, res);
}