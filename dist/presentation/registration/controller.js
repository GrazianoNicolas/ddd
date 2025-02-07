"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const postgres_1 = require("../../data/postgres");
const dtos_1 = require("../../domain/dtos");
// !GET /cursos/:id/estudiantes: Listar los estudiantes inscritos en un curso específico por su id.
// !POST /inscripciones: Inscribir a un estudiante en un curso.
// ! No debe permitir inscribir al mismo estudiante más de una vez en el mismo curso..
class RegistrationController {
    constructor() {
        this.allRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const allStudent = yield postgres_1.prima.registration.findMany({
                where: { delet: false },
            });
            res.json(allStudent);
        });
        this.getRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = +req.params.id;
            if (isNaN(id))
                res.status(400).json({ error: "Id argument is not number " });
            const registration = yield postgres_1.prima.registration.findFirst({
                where: { id: id, delet: false },
            });
            registration
                ? res.json(registration)
                : res.status(404).json({ error: "Error El estudiante no existe" });
        });
        this.createRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const [error, createRegistrationDto] = dtos_1.CreateRegistrationDto.create(req.body);
            if (error)
                res.status(400).json({ error });
            //PREGUNTAR si existe el estudiante y el curso
            const course = yield postgres_1.prima.course.findFirst({
                where: { id: createRegistrationDto.course, delet: false },
            });
            const student = yield postgres_1.prima.student.findFirst({
                where: { id: createRegistrationDto.student, delet: false },
            });
            if (student && course) {
                const registration = yield postgres_1.prima.registration.findFirst({
                    where: { studentId: student.id, courseId: course.id, delet: false },
                });
                if (!registration) {
                    const newregistration = yield postgres_1.prima.registration.create({
                        data: { studentId: student.id, courseId: course.id, delet: false },
                    });
                    res.json(newregistration);
                }
                else {
                    res.status(409).json({ error: " ya existe una inscripcion" });
                }
            }
            else {
                res.status(404).json({ error: " el estudiante o el curso  no existe" });
            }
        });
        this.updateRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = +req.params.id;
            const [error, updateRegistrationDto] = dtos_1.UpdateRegistrationDto.create(Object.assign(Object.assign({}, req.body), { id }));
            if (error)
                res.status(400).json({ error });
            //todo PREGUNTAR si existe el estudiante y el curso
            const course = yield postgres_1.prima.course.findFirst({
                where: { id: updateRegistrationDto.course, delet: false },
            });
            const student = yield postgres_1.prima.student.findFirst({
                where: { id: updateRegistrationDto.student, delet: false },
            });
            console.log(course);
            console.log(student);
            if (student && course) {
                //todo ME fijo si esta inscripto en una materia existente para que no se halla duplicados
                const olRregistrations = yield postgres_1.prima.registration.findFirst({
                    where: { studentId: student.id, courseId: course.id, delet: false },
                });
                if (!olRregistrations) {
                    const updateregistration = yield postgres_1.prima.registration.update({
                        where: { id: id, delet: false },
                        data: { studentId: student.id, courseId: course.id },
                    });
                    if (updateregistration) {
                        res.json(updateregistration);
                    }
                    else {
                        res.status(404).json({ error: " no se encontro la inscripcion " });
                    }
                }
                else {
                    res
                        .status(404)
                        .json({
                        error: "ya tiene una inscripcion en ese curso, no puede haber dupliacdos",
                    });
                }
            }
            else {
                res.status(404).json({ error: " el estudiante o el curso  no existe" });
            }
        });
        this.deleteRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = +req.params.id;
            const { delet } = req.body;
            if (isNaN(id))
                res.status(400).json({ error: "Id argument is not number " });
            try {
                let registration = yield postgres_1.prima.registration.findFirst({
                    where: { id: id, delet: false },
                });
                console.log(registration);
                if (registration) {
                    let registration = yield postgres_1.prima.registration.update({
                        where: { id: id, delet: false },
                        data: { delet: true },
                    });
                    res.json(registration);
                }
                else {
                    res.status(404).json({ error: " el registro no existe" });
                }
            }
            catch (error) {
                res.status(500).json({ error: "problema con la conexion " });
            }
        });
    }
}
exports.RegistrationController = RegistrationController;
