import { ICommandHandler } from '../../../framework/command-handlers';
import { IRepository } from '../../../framework/infrastructure';
import { InMemoryRepository } from '../../../framework/infrastructure';
import { SharedAccountCommand, SharedAccountCommandName, ICreateCommandPayload, IAddUserCommandPayload } from '../domain/commands';
import { SharedAccountAggregate } from '../domain/aggregates/impl';
import { IEventBase } from 'framework/events';

export class SharedAccountCommandHandler implements ICommandHandler<SharedAccountCommand> {
  constructor(
    private readonly repository: IRepository<SharedAccountAggregate> = new InMemoryRepository(),
  ) {}

  public async handle(command: SharedAccountCommand): Promise<void> {
    switch (command.name) {
      case SharedAccountCommandName.CREATE:
        await this.handleCreateCommand(command.payload);
        break;
      case SharedAccountCommandName.ADD_USER:
        await this.handleAddUserCommand(command.payload);
        break;
      default:
        throw new Error(`Can no handle command : ${ command.name}`);
    }
  }

  private async handleCreateCommand(payload: ICreateCommandPayload): Promise<void> {
    const aggregate = new SharedAccountAggregate();
    aggregate.create(payload.description, payload.owner);
    await this.repository.insert(aggregate.id, aggregate.uncommittedChanges);
  }

  private async handleAddUserCommand(payload: IAddUserCommandPayload): Promise<void> {
    const aggregate: SharedAccountAggregate = await this.repository.find(
      payload.accountID,
      (events: IEventBase[]): SharedAccountAggregate => this.rebuildProcess(events),
    ) as SharedAccountAggregate;
    aggregate.addUser(payload.userID);
    await this.repository.insert(aggregate.id, aggregate.uncommittedChanges);
  }

  private rebuildProcess(events: IEventBase[]): SharedAccountAggregate {
    return new SharedAccountAggregate().rebuild(events) as SharedAccountAggregate;
  }
}
