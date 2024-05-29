import { BadRequestException } from "@nestjs/common";

export const fileFilter = (req:Express.Request, file:Express.Multer.File, callback:Function) => {
    
    const validExtension = ['jpg', 'png', 'jpeg', 'gif'];
    const fileExtension = file.mimetype.split('/')[1];

    if(!validExtension.includes(fileExtension)) {
        return callback(new BadRequestException('Invalid extension'), false);
    }
    callback(null, true);
}