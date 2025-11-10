import { TimeSlot } from '../domain/TimeSlot';
import TimeSlotModel from '../database/models/TimeSlot';

export class TimeSlotMapper {
  static toDomain(model: InstanceType<typeof TimeSlotModel>): TimeSlot {
    return new TimeSlot(
      model.id as any,
      model.slotTime,
      model.maxCapacity,
      model.maxCapacity,
      new Date(model.createdAt),
      new Date(model.createdAt)
    );
  }

  static toPersistence(domain: TimeSlot): Record<string, any> {
    return {
      id: domain.id,
      slotTime: domain.time,
      maxCapacity: domain.capacity,
    };
  }
}
