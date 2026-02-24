"use client";

import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Animal = {
  id: string;
  name: string;
  breed: string;
  age: string;
  animalType: string;
  AggressionLevel: string;
  AggressionNote: string;
  DogFriendly: string;
  CatFriendly: string;
  KidFriendly: string;
  personality: string;
  temporaryEnd: string;
  status: string;
  gender: string;
  images: string[];
  healthInfo: string;
  description: string;
  sterilized: string;
  createdAt: string;
};
const Page = () => {
  const [animal, setAnimal] = useState<Animal>();
  const params = useParams();
  const animalId = params.animalId;

  const fetchAnimal = async () => {
    const res = await fetch(`/api/adopt-animal/${animalId}`);
    if (res.ok) {
      const data = await res.json();
      setAnimal(data);
    }
  };

  useEffect(() => {
    fetchAnimal();
  }, [animalId]);

  console.log(animal);
  return (
    <div>
      <div>
        <div>Yagaad Urchluuleh bolson shaltgaan</div>
        <div>{animal?.description}</div>
        <div>Sain uu ? namaig {animal?.name} gedeg.</div>
        <div>{animal?.name} tuhai</div>
        <div>Eronhii medeelel</div>
        <div>{animal?.age}</div>
        <div>{animal?.gender}</div>
        <div>{animal?.breed}</div>
        <div>{animal?.healthInfo}</div>
        <div>zasalga hiilgesen eseh</div>
        <div>{animal?.sterilized}</div>
        <div>butsaaj avah hugatsaa</div>
        <div>{animal?.status === "TEMPORARY" ? animal.temporaryEnd : ""}</div>
        <div>Zan chanar</div>
        {/* <div>
        Dog Friendly : {animal?.DogFriendly === "Yes" ? "Тийм" : "Үгүй" : "Тодорхойгүй"}
      </div>
      <div>Cat Friendly : {animal?.CatFriendly  === "Yes" ? "Тийм" : "Үгүй" : "Тодорхойгүй"}</div>
      <div>Kid Friendly : {animal?.KidFriendly  === "Yes" ? "Тийм" : "Үгүй" : "Тодорхойгүй"}</div>
      <div>Aggression Level : {animal?.AggressionLevel === "High" ? "Өндөр" : "Дунд" : "Бага"}</div>
      <div>{animal?.AggressionNote}</div> */}
      </div>
      <div>Urchuuleh uil yvts</div>
      <div>1. Fill out the adoption form</div>
      <div>2. We Review Your Application</div>
      <div>3. We Setup a Phone Call</div>
      <div>4. You Meet Your Animal</div>

      <div>
        <Input placeholder =""/>
      </div>
    </div>
  );
};

export default Page;
