import ecs = require('@aws-cdk/aws-ecs'); // Allows working with ECS resources
import ec2 = require('@aws-cdk/aws-ec2'); // Allows working with EC2 and VPC resources
import iam = require('@aws-cdk/aws-iam'); // Allows working with IAM resources
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns') // Helper to create ECS services with loadbalancers, and configure them
import * as cdk from '@aws-cdk/core';


export class CdkEcsInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Look up the default VPC
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true
    });

    // IAM role to link to the container
    const taskIamRole = new iam.Role(this, "AppRole", {
      roleName: "AppRole",
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'Task', {
      taskRole: taskIamRole,
    });

    taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromAsset('../SampleApp'),
      portMappings: [{ containerPort: 80}],
      memoryReservationMiB: 256,
      cpu: 256,
    });

    new ecsPatterns.ApplicationLoadBalancedFargateService(this, "MyApp", {
      vpc: vpc,
      taskDefinition: taskDefinition,
      desiredCount: 1,
      serviceName: 'MyWebApp',
      assignPublicIp: true,
      publicLoadBalancer: true,
    });
  }
}
