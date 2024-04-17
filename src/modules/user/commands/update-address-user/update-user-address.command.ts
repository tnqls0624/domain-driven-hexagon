import { Command, CommandProps } from '@libs/ddd';

export class UpdateUserAddressCommand extends Command {
  readonly id: string;

  readonly country: string;

  readonly postalCode: string;

  readonly street: string;

  constructor(props: CommandProps<UpdateUserAddressCommand>) {
    super(props);
    this.id = props.id as string;
    this.country = props.country;
    this.postalCode = props.postalCode;
    this.street = props.street;
  }
}
