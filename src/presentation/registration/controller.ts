import {Request, Response} from 'express';
import { prima } from "../../data/postgres";
import { CreateRegistrationDto, UpdateRegistrationDto } from '../../domain/dtos';
import { error } from 'console';
import { RegistrationRepository } from '../../domain';


// !GET /cursos/:id/estudiantes: Listar los estudiantes inscritos en un curso específico por su id.

// !POST /inscripciones: Inscribir a un estudiante en un curso.


// ! No debe permitir inscribir al mismo estudiante más de una vez en el mismo curso..


export class RegistrationController {
  constructor(private readonly registrationRepository:RegistrationRepository) {}

  public allRegistration = async (req: Request, res: Response) => {
    const allStudent = await this.registrationRepository.getAll();
    
    res.json(allStudent);
  };

  public getRegistration = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      res.status(400).json({ error: "Id argument is not number " });
      try {
        const registration = await this.registrationRepository.findById(id);
        res.json(registration);
      } catch (error) {
        res.status(400).json(error);
      }
    

  
  };

  public createRegistration = async (req: Request, res: Response) => {
    const [error, createRegistrationDto] = CreateRegistrationDto.create(
      req.body
    );
    if (error) res.status(400).json({ error });

    //PREGUNTAR si existe el estudiante y el curso

    const course = await prima.course.findFirst({
      where: { id: createRegistrationDto!.course, delet: false },
    });

    const student = await prima.student.findFirst({
      where: { id: createRegistrationDto!.student, delet: false },
    });

    if (student && course) {
      const registration = await prima.registration.findFirst({
        where: { studentId: student.id, courseId: course.id, delet: false },
      });

      if (!registration) {
        const newregistration = await this.registrationRepository.create(
          createRegistrationDto!
        );

        res.json(newregistration);
      } else {
        res.status(409).json({ error: " ya existe una inscripcion" });
      }
    } else {
      res.status(404).json({ error: " el estudiante o el curso  no existe" });
    }
  };

  public updateRegistration = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const [error, updateRegistrationDto] = UpdateRegistrationDto.create({
      ...req.body,
      id,
    });
    if (error) res.status(400).json({ error });

    //todo PREGUNTAR si existe el estudiante y el curso
    const course = await prima.course.findFirst({
      where: { id: updateRegistrationDto!.course, delet: false },
    });

    const student = await prima.student.findFirst({
      where: { id: updateRegistrationDto!.student, delet: false },
    });

    if (student && course) {
      //todo ME fijo si esta inscripto en una materia existente para que no halla duplicados
      const olRregistrations = await prima.registration.findFirst({
        where: { studentId: student.id, courseId: course.id, delet: false },
      });

      if (!olRregistrations) {
        const updateregistration = await this.registrationRepository.updateById(
          updateRegistrationDto!);

        if (updateregistration) {
          res.json(updateregistration);
        } else {
          res.status(404).json({ error: " no se encontro la inscripcion " });
        }
      } else {
        res.status(404).json({
          error:
            "ya tiene una inscripcion en ese curso, no puede haber dupliacdos",
        });
      }
    } else {
      res.status(404).json({ error: " el estudiante o el curso  no existe" });
    }
  };

  public deleteRegistration = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const { delet } = req.body;

    if (isNaN(id))
      res.status(400).json({ error: "Id argument is not number " });

    try {
      let registration = await prima.registration.findFirst({
        where: { id: id, delet: false },
      });
      if (registration) {
        let registration = await this.registrationRepository.deleteById(id);

        res.json(registration);
      } else {
        res.status(404).json({ error: " el registro no existe" });
      }
    } catch (error) {
      res.status(500).json({ error: "problema con la conexion " });
    }
  };
}