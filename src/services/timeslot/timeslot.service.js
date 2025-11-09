import { timeslotApi } from "./timeslot.api";

export const timeslotService = {
  list: async () => {
    return await timeslotApi.getAll();
  },
};
