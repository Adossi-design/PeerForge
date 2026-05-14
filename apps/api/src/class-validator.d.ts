declare module 'class-validator' {
  export function IsEmail(): any;
  export function IsNotEmpty(): any;
  export function MinLength(length: number): any;
  export function MaxLength(length: number): any;
  export function IsOptional(): any;
  export function IsEnum(type: any): any;
  export function IsNumber(): any;
  export function IsArray(): any;
  export function Min(value: number): any;
  export function validate(obj: any): any;
}
