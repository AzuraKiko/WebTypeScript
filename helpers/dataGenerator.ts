// web/helpers/dataGenerator.ts
// chức năng generateUser

import { faker } from '@faker-js/faker';

export const generateUser = () => ({
  username: faker.internet.userName(),
  password: faker.internet.password(),
  email: faker.internet.email(),
});
