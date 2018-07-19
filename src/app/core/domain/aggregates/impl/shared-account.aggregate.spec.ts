import { SharedAccountAggregateImpl } from './shared-account.aggregate';
import { SharedAccountCreated, SharedAccountUserAdded, SharedAccountExpendAdded } from '../../events';
import { SharedAccountModelImpl, IExpend } from '../../read-models';

describe('Shared Account Aggregate', () => {
  it('should have a SharedAccountCreated event when create a new SharedAccount', () => {
    const description: string = 'description';
    const owner: string = 'owner';
    const aggregate = new SharedAccountAggregateImpl();
    aggregate.create(description, owner);
    expect(aggregate.uncommittedChanges).toContainEqual(
      new SharedAccountCreated(aggregate.id, owner, description),
    );
    expect(aggregate.model).toEqual(
      new SharedAccountModelImpl(aggregate.id, owner, description),
    );
  });

  it('should have a SharedAccountUserAdded event when add a new user', () => {
    const description: string = 'description';
    const owner: string = 'owner';
    const aggregate = new SharedAccountAggregateImpl();
    aggregate.create(description, owner);
    aggregate.addUser('newUser');
    expect(aggregate.uncommittedChanges).toContainEqual(
      new SharedAccountUserAdded(aggregate.id, 'newUser'),
    );
  });

  it('should have a SharedAccountExpendAdded event when add a new expend', () => {
    const description: string = 'description';
    const owner: string = 'owner';
    const aggregate = new SharedAccountAggregateImpl();
    aggregate.create(description, owner);
    const newUser = 'newUser';
    aggregate.addUser(newUser);
    const expend: IExpend = {
      owner,
      involvedUsers: [ owner, newUser ],
      amount: 100,
    };
    aggregate.addExpend(expend);
    expect(aggregate.uncommittedChanges).toContainEqual(
      new SharedAccountExpendAdded(aggregate.id, expend),
    );
  });
});
