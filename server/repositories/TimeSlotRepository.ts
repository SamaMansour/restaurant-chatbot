import { TimeSlot } from '../domain/TimeSlot';
import { TimeSlotMapper } from '../mappers/TimeSlotMapper';
import TimeSlotModel from '../database/models/TimeSlot';
import { Op } from 'sequelize';

export class TimeSlotRepository {
  async findByTime(time: string): Promise<TimeSlot | null> {
    const model = await TimeSlotModel.findOne({
      where: { slotTime: time },
    });

    return model ? TimeSlotMapper.toDomain(model) : null;
  }

  async findAvailableSlots(): Promise<TimeSlot[]> {
    const models = await TimeSlotModel.findAll({
      where: {
        isActive: true,
      },
      order: [['slotTime', 'ASC']],
    });

    return models.map(model => TimeSlotMapper.toDomain(model));
  }

  async update(timeSlot: TimeSlot): Promise<TimeSlot> {
    const model = await TimeSlotModel.findByPk(timeSlot.id);
    if (!model) {
      throw new Error(`TimeSlot with id ${timeSlot.id} not found`);
    }

    const updateData = TimeSlotMapper.toPersistence(timeSlot);
    await model.update(updateData);
    await model.reload();

    return TimeSlotMapper.toDomain(model);
  }
}
