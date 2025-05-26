import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from 'three';

export class StudioLightScene extends Scene
{
  constructor()
  {
    super();

    const m0 = new Mesh(new BoxGeometry(3, 3, 3), new MeshBasicMaterial({ color: 0xffffff }));
    const m1 = new Mesh(new BoxGeometry(3, 3, 3), new MeshBasicMaterial({ color: 0xffffff }));
    const m2 = new Mesh(new BoxGeometry(3, 3, 3), new MeshBasicMaterial({ color: 0xffffff }));
    const m3 = new Mesh(new BoxGeometry(5, 3, 5), new MeshBasicMaterial({ color: 0xffffff }));

    const m4_floor = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial({ color: 0xffffff }));

    m0.material.color.multiplyScalar(5);
    m1.material.color.multiplyScalar(5);
    m2.material.color.multiplyScalar(5);
    m3.material.color.multiplyScalar(5);
    m4_floor.material.color.multiplyScalar(0.25);
    this.add(m0);
    this.add(m1);
    this.add(m2);
    this.add(m3);
    this.add(m4_floor);

    const height = 5;
    m0.position.set(5, height, 5);
    m1.position.set(-5, height, 5);
    m2.position.set(5, height, -5);
    m3.position.set(-5, height, -5);
    m4_floor.position.set(0, -1, 0);
  }
}
