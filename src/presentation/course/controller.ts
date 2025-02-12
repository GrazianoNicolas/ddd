import {Request, Response} from 'express';
import { prima } from "../../data/postgres";
import { CreateCourserDto, UpdateCourserDto } from '../../domain/dtos';
import { CourseRepository } from '../../domain';


export class CourseController {
  constructor(private readonly courseRepository:CourseRepository) {}


  public allCourse = async (req: Request, res: Response) => {
    const allStudent = await this.courseRepository.getAll();
    res.json(allStudent);
  };




  public getCourse = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      res.status(400).json({ error: "Id argument is not number " });

    try {
      const course = await this.courseRepository.findById(id);

      res.status(200).json(course);
     
    } catch (erro) {
      res.status(404).json( erro);
    }
  }




  public createCourse = async (req: Request, res: Response) => {
    const [erro, createCourseDto] = CreateCourserDto.create(req.body);
    if (erro) res.status(400).json({ erro });
 
      const teache = await prima.teacher.findFirst({
        where: { id: createCourseDto!.teacher, delet: false },
      });

        if (teache){
            const oldstudent = await prima.course.findFirst({
              where: {
                name: createCourseDto!.name,
                teacherId: createCourseDto!.teacher,
                delet: false,
              },
            });

          if (oldstudent) {
            res.status(404).json({ error: "el curso ya existe" });
          }else{
              const newCourse = await this.courseRepository.create(
                createCourseDto!
              );

              res.status(200).json(newCourse);
          }
        }else{ 
          res.status(404).json({ error: "no existe el profesor " });
        };
 

  };

  public updateCourse = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const [error, updateCourserDto] = UpdateCourserDto.update({...req.body, id });
      if (error)  res.status(400).json({ error });

   
    //verificar si existe el profesor
    const teache = await prima.teacher.findFirst({
      where: { id: updateCourserDto!.teacher, delet: false },
    });

    console.log(teache);
    if (teache) {

      const course = await this.courseRepository.updateById(updateCourserDto!);
      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json({ error: "Error el curso no existe" });
      }
    } else {
      res.status(404).json({ error: "no existe el profesor " });
    }
  };

  public deleteCourse = async (req: Request, res: Response) => {
    const id = +req.params.id;

    if (isNaN(id))
      res.status(400).json({ error: "Id argument is not number " });

    let course = await this.courseRepository.deleteById(id);

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: "Error el curso no existe" });
    }
  };
}